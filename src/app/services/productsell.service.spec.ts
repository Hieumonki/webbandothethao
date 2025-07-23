/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProductsellService } from './productsell.service';

describe('Service: Productsell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsellService]
    });
  });

  it('should ...', inject([ProductsellService], (service: ProductsellService) => {
    expect(service).toBeTruthy();
  }));
});
