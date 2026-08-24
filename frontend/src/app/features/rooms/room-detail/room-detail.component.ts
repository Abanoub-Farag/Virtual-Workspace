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
} from 'lucide-angular';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { RoomService, RoomData } from '../services/room.service';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

interface Participant {
  id: number;
  name: string;
  role: 'Host' | 'Member';
  avatar: string;
  online: boolean;
}

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
  tasks = signal<Task[]>([
    { id: 1, text: 'Review Q3 marketing assets for brand compliance', done: true },
    { id: 2, text: 'Update primary component library with new tokens', done: false },
    { id: 3, text: 'Draft weekly sync notes for the team', done: false },
  ]);
  newTaskText = signal<string>('');

  // ── Participants ──────────────────────────────────────────────────────────
  participants: Participant[] = [
    {
      id: 1,
      name: 'Alex Morgan',
      role: 'Host',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      online: true,
    },
    {
      id: 2,
      name: 'Jordan Lee',
      role: 'Member',
      avatar: 'https://i.pravatar.cc/150?u=jordan',
      online: true,
    },
    {
      id: 3,
      name: 'Sam Rivera',
      role: 'Member',
      avatar: 'https://i.pravatar.cc/150?u=sam',
      online: true,
    },
  ];

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.fetchRoom(id);
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
  toggleTask(taskId: number) {
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    );
  }

  addTask() {
    const text = this.newTaskText().trim();
    if (!text) return;
    this.tasks.update((tasks) => [
      ...tasks,
      { id: Date.now(), text, done: false },
    ]);
    this.newTaskText.set('');
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
