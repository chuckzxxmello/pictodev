import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms'; // <--- import this

export interface InventoryItem {
  item_id: string;
  item_name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  date_added: string;
  selected?: boolean;
}

const INVENTORY_DATA: InventoryItem[] = [
  {item_id: '101', item_name: 'Ergonomic Office Chair', description: 'Comfortable office chair with adjustable height and lumbar support', category: 'Office Furniture', quantity: 15, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-12'},
  {item_id: '11', item_name: 'Ergonomic Office Chair', description: 'Comfortable office chair', category: 'Office Furniture', quantity: 15, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-12'},
  {item_id: '4', item_name: 'Office Desk', description: 'Wooden office desk', category: 'Office Furniture', quantity: 10, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-13'},
  {item_id: '5', item_name: 'Projector', description: 'HD projector for meetings', category: 'IT Equipment', quantity: 5, unit: 'pcs', location: 'Conference Room', status: 'Available', date_added: '2025-08-13'},
  {item_id: '6', item_name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', category: 'IT Equipment', quantity: 25, unit: 'pcs', location: 'IT Office', status: 'Available', date_added: '2025-08-12'},
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    RouterOutlet,
    MatSlideToggleModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
  <nav class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">PICTOIMS</div>
      <div class="sidebar-user">
        <span>{{ currentUser()?.email || currentUser()?.username }}</span>
      </div>
    </div>
    <ul class="sidebar-menu">
      <li *ngFor="let link of menuLinks">
        <a [routerLink]="[link.path]" [class.active]="isActiveRoute(link.path)" class="menu-item">
          <mat-icon>{{link.icon}}</mat-icon> {{link.label}}
        </a>
      </li>
      <li>
        <a href="#" (click)="logout()" class="menu-item">
          <mat-icon></mat-icon> Log out
        </a>
      </li>
    </ul>
  </nav>

  <main class="main-content">
    <header class="top-header">
      <div class="header-left">
        
      </div>
      <div class="header-right">
        
      </div>
    </header>

    <div class="content-area">
      <div class="table-section">
        <div class="table-controls">
          <div class="controls-left">
            <button mat-stroked-button class="export-btn">
              Export
            </button>
            <button mat-stroked-button class="add-btn">
              Add
            </button>
            <button mat-stroked-button class="add-btn">
              Edit
            </button>
            <button mat-stroked-button class="add-btn">
              Delete
            </button>
          </div>
          <div class="controls-right">
            <mat-form-field appearance="outline" class="search-field">
              <input matInput placeholder="Search..">
            </mat-form-field>
            
          </div>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" class="data-table">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox [checked]="isAllSelected()" [indeterminate]="isIndeterminate()" (change)="toggleAllSelection()"></mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox [(ngModel)]="row.selected"></mat-checkbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="item_id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let element">{{element.item_id}}</td>
            </ng-container>

            <ng-container matColumnDef="item_name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let element">{{element.item_name}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let element">{{element.description}}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let element">{{element.category}}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Qty</th>
              <td mat-cell *matCellDef="let element">{{element.quantity}}</td>
            </ng-container>

            <ng-container matColumnDef="unit">
              <th mat-header-cell *matHeaderCellDef>Unit</th>
              <td mat-cell *matCellDef="let element">{{element.unit}}</td>
            </ng-container>

            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let element">{{element.location}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <span class="status-badge" [class.available]="element.status==='Available'" [class.unavailable]="element.status!=='Available'">
                  {{element.status}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date_added">
              <th mat-header-cell *matHeaderCellDef>Date Added</th>
              <td mat-cell *matCellDef="let element">{{element.date_added}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.selected-row]="row.selected"></tr>
          </table>
        </div>
      </div>
    </div>
  </main>
  `,
  styles: [`
    .sidebar { width: 220px; background: #1f2937; color: #f9fafb; position: fixed; height: 100%; display: flex; flex-direction: column; }
    .sidebar-title { font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 16px; }
    .sidebar-menu { list-style: none; padding: 0; flex-grow: 1; }
    .menu-item { display: flex; align-items: center; padding: 12px 20px; color: #f9fafb; text-decoration: none; gap: 12px; border-radius: 6px; transition: 0.2s; }
    .menu-item:hover { background: #374151; }
    .menu-item.active { background: #3b82f6; font-weight: 600; }

    .main-content { margin-left: 220px; background: #f3f4f6; min-height: 100vh; display: flex; flex-direction: column; }
    .top-header { height: 60px; background: white; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .table-section { margin: 16px; background: white; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden; }
    .table-controls { display: flex; justify-content: space-between; padding: 16px; }
    .controls-left button { margin-right: 8px; }
    .data-table { width: 100%; border-spacing: 0; font-size: 0.875rem; }
    .data-table th { background: #f9fafb; padding: 12px; font-weight: 600; }
    .data-table td { padding: 12px; }
    .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.available { background: #d1fae5; color: #065f46; }
    .status-badge.unavailable { background: #fee2e2; color: #991b1b; }
  `]
})
export class Dashboard {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);
  searchTerm = signal('');
  displayedColumns: string[] = ['select','item_id','item_name','description','category','quantity','unit','location','status','date_added'];
  dataSource = INVENTORY_DATA;

  menuLinks = [
    {path:'/dashboard', label:'Dashboard', icon:''},
    {path:'/inventory', label:'Inventory', icon:''},
    {path:'/requests', label:'Request', icon:''},
    {path:'/requisitions', label:'Requisition', icon:''},
    {path:'/transfers', label:'Transfer', icon:''},
    {path:'/repairs', label:'Repair Status', icon:''}
  ];

  constructor() {
    this.authService.currentUser$.subscribe(user => this.currentUser.set(user));
  }

  getInitials() { return this.currentUser()?.email?.charAt(0).toUpperCase() || 'A'; }
  isActiveRoute(route: string) { return this.router.url.startsWith(route); }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
  onSearch(event: Event) { this.searchTerm.set((event.target as HTMLInputElement).value); }
  isAllSelected() { return this.dataSource.every(row => row.selected); }
  isIndeterminate() { const selectedCount = this.dataSource.filter(r=>r.selected).length; return selectedCount>0 && selectedCount<this.dataSource.length; }
  toggleAllSelection() { const allSelected=this.isAllSelected(); this.dataSource.forEach(r=>r.selected=!allSelected); }
}