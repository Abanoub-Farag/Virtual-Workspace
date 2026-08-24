import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { timer, switchMap, retry, catchError, of } from 'rxjs';
import {
  LucideAngularModule,
  ArrowLeft,
  Bell,
  Clock,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Plus,
  CheckCircle2,
  Circle,
  HelpCircle,
  ClipboardList,
  Trash2,
} from 'lucide-angular';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { RoomTimerComponent } from '../components/room-timer/room-timer.component';
import { RoomJoinComponent } from '../components/room-join/room-join.component';
import { RoomService, RoomData } from '../services/room.service';
import { TaskService, TaskData } from '../services/task.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    SidebarComponent,
    RoomTimerComponent,
    RoomJoinComponent,
  ],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roomService = inject(RoomService);
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Lucide Icons ──────────────────────────────────────────────────────────
  readonly ArrowLeftIcon = ArrowLeft;
  readonly BellIcon = Bell;
  readonly ClockIcon = Clock;
  readonly RotateCcwIcon = RotateCcw;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly SettingsIcon = Settings;
  readonly PlusIcon = Plus;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly CircleIcon = Circle;
  readonly HelpCircleIcon = HelpCircle;
  readonly CheckSquareIcon = ClipboardList;
  readonly Trash2Icon = Trash2;

  // ── Room data ─────────────────────────────────────────────────────────────
  room = signal<RoomData | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // ── Heartbeat State ───────────────────────────────────────────────────────
  heartbeatStatus = signal<'active' | 'retrying' | 'failed'>('active');
  heartbeatErrorMessage = signal<string | null>(null);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  tasks = signal<TaskData[]>([]);
  isTasksLoading = signal<boolean>(true);
  tasksError = signal<string | null>(null);
  newTaskText = signal<string>('');

  // ── Participants ──────────────────────────────────────────────────────────
  participants = signal<any[]>([]);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.joinRoom(id);
        this.fetchRoom(id);
        this.fetchTasks();
        this.startHeartbeat(id);
      } else {
        this.error.set('Invalid Room ID');
        this.isLoading.set(false);
      }
    }
  }

  joinRoom(id: number) {
    this.roomService.joinRoom(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        console.log(`Successfully joined room ${id}:`, res);
      },
      error: (err) => {
        console.error(`Error joining room ${id}:`, err);
      }
    });
  }

  private startHeartbeat(roomId: number) {
    const INTERVAL_MS = 25000; // 25s keep-alive interval
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 3;

    timer(0, INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.roomService.sendHeartbeat(roomId).pipe(
            retry({
              count: 2,
              delay: (error: HttpErrorResponse, retryCount: number) => {
                // Critical security/membership errors should fail immediately without retry
                if ([401, 403, 404].includes(error.status)) {
                  throw error;
                }
                return timer(retryCount * 2000);
              }
            }),
            catchError((err: HttpErrorResponse) => {
              return of({ isError: true, error: err });
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => {
        if (res?.isError) {
          const err: HttpErrorResponse = res.error;
          const isCritical = [401, 403, 404].includes(err.status);
          consecutiveFailures++;

          if (isCritical || consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            this.heartbeatStatus.set('failed');
            const parsedMsg = this.extractHeartbeatError(err);
            this.heartbeatErrorMessage.set(parsedMsg);
            if (err.status === 404) {
              this.error.set('Room has been closed or no longer exists.');
            } else if (err.status === 401 || err.status === 403) {
              this.error.set('Session expired or access to this room was revoked.');
            }
          } else {
            this.heartbeatStatus.set('retrying');
          }
        } else {
          consecutiveFailures = 0;
          this.heartbeatStatus.set('active');
          this.heartbeatErrorMessage.set(null);
        }
      });
  }

  private extractHeartbeatError(err: HttpErrorResponse | any): string {
    if (err.status === 0 || err.error instanceof ErrorEvent) {
      return 'Network connection lost. Retrying heartbeat connection...';
    }

    const payloadMsg = err.error?.message;
    const payloadErrors = err.error?.errors;

    if (payloadErrors && typeof payloadErrors === 'object') {
      const formatted = Object.entries(payloadErrors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      if (formatted) return formatted;
    }

    switch (err.status) {
      case 401: return payloadMsg || 'Unauthorized room session.';
      case 403: return payloadMsg || 'Access denied to this room.';
      case 404: return payloadMsg || 'Room not found or session ended.';
      case 500: return payloadMsg || 'Internal server error while sending keep-alive heartbeat.';
      default: return payloadMsg || `Heartbeat failed (Status ${err.status}).`;
    }
  }

  fetchRoom(id: number) {
    this.roomService.getRoomById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.data) {
          this.room.set(response.data);
        } else {
          this.error.set('Room data not found.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load room details.');
        this.isLoading.set(false);
      },
    });
  }

  fetchTasks() {
    this.isTasksLoading.set(true);
    this.tasksError.set(null);
    this.taskService.getTasks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.tasks.set(response.data?.content || []);
        this.isTasksLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.tasksError.set('Failed to load tasks.');
        this.isTasksLoading.set(false);
      }
    });
  }

  // ── Task controls ─────────────────────────────────────────────────────────
  toggleTask(task: TaskData) {
    const updatedStatus = !task.isCompleted;
    // Optimistic update
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: updatedStatus } : t)),
    );
    this.taskService.updateTask(task.id, { title: task.title, isCompleted: updatedStatus })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to update task', err);
          // Revert on error
          this.tasks.update((tasks) =>
            tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t)),
          );
        }
      });
  }

  addTask() {
    const text = this.newTaskText().trim();
    if (!text) return;
    this.newTaskText.set('');
    
    this.taskService.createTask({ title: text, isCompleted: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fetchTasks(); // Refetch to get the ID and correct state
        },
        error: (err) => {
          console.error('Failed to create task', err);
        }
      });
  }

  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter(t => t.id !== taskId));
        },
        error: (err) => {
          console.error('Failed to delete task', err);
        }
      });
  }

  onNewTaskKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTask();
    }
  }

  onNewTaskInput(event: Event) {
    this.newTaskText.set((event.target as HTMLInputElement).value);
  }
}
