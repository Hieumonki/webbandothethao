/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProdutCategoryService } from './produt-category.service';

describe('Service: ProdutCategory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProdutCategoryService]
    });
  });

  it('should ...', inject([ProdutCategoryService], (service: ProdutCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
