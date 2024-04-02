import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetsPageComponent } from './facets-page.component';

describe('FacetsPageComponent', () => {
  let component: FacetsPageComponent;
  let fixture: ComponentFixture<FacetsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
