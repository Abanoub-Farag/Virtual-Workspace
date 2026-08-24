import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
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
import { RoomService, RoomData } from '../services/room.service';
import { TaskService, TaskData } from '../services/task.service';


const TIMER_DURATION = 25 * 60; // 25 minutes in seconds
const RING_RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 565.49

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    SidebarComponent,
  ],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss'],
})
export class RoomDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly roomService = inject(RoomService);
  private readonly taskService = inject(TaskService);

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

  // ── Timer ─────────────────────────────────────────────────────────────────
  timeLeft = signal<number>(TIMER_DURATION);
  isRunning = signal<boolean>(false);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly minutesDisplay = computed(() =>
    Math.floor(this.timeLeft() / 60)
      .toString()
      .padStart(2, '0'),
  );

  readonly secondsDisplay = computed(() =>
    (this.timeLeft() % 60).toString().padStart(2, '0'),
  );

  readonly ringProgress = computed(() => {
    const progress = this.timeLeft() / TIMER_DURATION;
    return CIRCUMFERENCE * (1 - progress);
  });

  readonly circumference = CIRCUMFERENCE;

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

  ngOnDestroy() {
    this.clearInterval();
  }

  fetchRoom(id: number) {
    this.roomService.getRoomById(id).subscribe({
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
    this.taskService.getTasks().subscribe({
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

  // ── Timer controls ────────────────────────────────────────────────────────
  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
    if (this.timeLeft() === 0) return;
    this.isRunning.set(true);
    this.intervalId = setInterval(() => {
      const current = this.timeLeft();
      if (current <= 1) {
        this.timeLeft.set(0);
        this.pauseTimer();
      } else {
        this.timeLeft.set(current - 1);
      }
    }, 1000);
  }

  private pauseTimer() {
    this.isRunning.set(false);
    this.clearInterval();
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft.set(TIMER_DURATION);
  }

  private clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Task controls ─────────────────────────────────────────────────────────
  toggleTask(task: TaskData) {
    const updatedStatus = !task.completed;
    // Optimistic update
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t)),
    );
    this.taskService.updateTask(task.id, { title: task.title, completed: updatedStatus }).subscribe({
      error: (err) => {
        console.error('Failed to update task', err);
        // Revert on error
        this.tasks.update((tasks) =>
          tasks.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t)),
        );
      }
    });
  }

  addTask() {
    const text = this.newTaskText().trim();
    if (!text) return;
    this.newTaskText.set('');
    
    this.taskService.createTask({ title: text, completed: false }).subscribe({
      next: () => {
        this.fetchTasks(); // Refetch to get the ID and correct state
      },
      error: (err) => {
        console.error('Failed to create task', err);
      }
    });
  }

  deleteTask(taskId: number) {
    this.taskService.deleteTask(taskId).subscribe({
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
