import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OrderComponent } from './order.component';
import { OrderService } from '../services/order.service';
import { UsersService } from '../services/users.service';
import { of } from 'rxjs';

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;
  let orderService: OrderService;
  let usersService: UsersService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, HttpClientModule, OrderComponent],
      providers: [OrderService, UsersService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    usersService = TestBed.inject(UsersService);
    spyOn(orderService, 'getOrders').and.returnValue(of([
      { _id: '1', orderId: '1212', productName: 'Star Refrgerrator', userId: { _id: 'user1', name: 'Mai Van Tuyen', status: 'active' }, totalAmount: 1200, payment: 'Paid', status: 'pending', category: 'electronics', createdAt: '2025-07-12', selected: false }
    ]));
    spyOn(usersService, 'getUsers').and.returnValue(of([
      { _id: 'user1', name: 'Mai Van Tuyen', email: 'tuyen@example.com', status: 'active', avatar: '', country: '' },
      { _id: 'user2', name: 'Nguyen Van A', email: 'a@example.com', status: 'active', avatar: '', country: '' }
    ]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders and users on init', () => {
    expect(component.orders.length).toBe(1);
    expect(component.totalOrders).toBe(1);
    expect(component.pendingOrders).toBe(1);
    expect(component.users.length).toBe(2);
  });

  it('should open edit modal with correct order', () => {
    const order = component.orders[0];
    component.editOrder(order);
    expect(component.isEditModalOpen).toBeTrue();
    expect(component.currentOrder).toEqual({ ...order, createdAt: '2025-07-12', selected: false });
  });

  it('should open add modal with blank order', () => {
    component.addNewOrder();
    expect(component.isAddModalOpen).toBeTrue();
    expect(component.currentOrder._id).toBe('');
    expect(component.currentOrder.orderId).toBe('');
  });

  it('should close add modal and reset currentOrder', () => {
    component.addNewOrder();
    component.currentOrder.orderId = 'test';
    component.closeAddModal();
    expect(component.isAddModalOpen).toBeFalse();
    expect(component.currentOrder.orderId).toBe('');
  });

  it('should update user name and status when userId changes', () => {
    component.currentOrder.userId._id = 'user2';
    component.updateUserName();
    expect(component.currentOrder.userId.name).toBe('Nguyen Van A');
    expect(component.currentOrder.userId.status).toBe('active');
  });

  it('should reset filters', () => {
    component.searchTerm = 'test';
    component.statusFilter = 'pending';
    component.fromDate = '2025-07-01';
    component.toDate = '2025-07-31';
    component.resetFilters();
    expect(component.searchTerm).toBe('');
    expect(component.statusFilter).toBe('');
    expect(component.fromDate).toBe('');
    expect(component.toDate).toBe('');
  });
});
