import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetsGroupItemComponent } from './facets-group-item.component';

describe('FacetsGroupItemComponent', () => {
  let component: FacetsGroupItemComponent;
  let fixture: ComponentFixture<FacetsGroupItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetsGroupItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetsGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
