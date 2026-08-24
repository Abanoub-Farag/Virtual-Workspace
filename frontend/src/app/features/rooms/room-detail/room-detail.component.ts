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
        this.fetchRoom(id);
        this.fetchTasks();
      } else {
        this.error.set('Invalid Room ID');
        this.isLoading.set(false);
      }
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
