import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService, RoomData } from '../services/room.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roomService = inject(RoomService);

  room = signal<RoomData | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

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
      }
    });
  }
}
