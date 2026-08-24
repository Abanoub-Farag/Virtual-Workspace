import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowRight, Eye } from 'lucide-angular';

export interface Room {
  id: string;
  title: string;
  description: string;
  tags: string[];
  actionType: 'join' | 'view';
}

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './room-card.component.html',
  styleUrls: ['./room-card.component.scss']
})
export class RoomCardComponent {
  @Input() room!: Room;
  @Output() onAction = new EventEmitter<string>();
  
  // Expose icons for template
  readonly ArrowRightIcon = ArrowRight;
  readonly EyeIcon = Eye;

  handleAction() {
    this.onAction.emit(this.room.id);
  }
}
