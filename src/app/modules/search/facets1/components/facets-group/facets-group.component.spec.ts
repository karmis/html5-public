import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetsGroupComponent } from './facets-group.component';

describe('FacetsGroupComponent', () => {
  let component: FacetsGroupComponent;
  let fixture: ComponentFixture<FacetsGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetsGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
