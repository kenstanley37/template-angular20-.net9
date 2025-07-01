import { Component, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { environment } from '../../../../environments/environment';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, NgxSliderModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private http = inject(HttpClient);

  salesData = signal<any[]>([]);
  salesXAxisLabel = 'Quarter';
  salesYAxisLabel = 'Sales';

  fullRevenue = signal<{ date: string; revenue: number }[]>([]);
  revenueXAxisLabel = 'Month';
  revenueYAxisLabel = 'Revenue';

  minTimestamp = signal(0);
  maxTimestamp = signal(0);
  value = signal(0);
  highValue = signal(0);

  sliderOptions: Options = {
    floor: 0,
    ceil: 0,
    translate: (val: number): string => new Date(val).toLocaleDateString()
  };

  brushData = computed(() =>
    this.fullRevenue().map(d => ({
      name: d.date,
      value: d.revenue
    }))
  );

filteredRevenue = computed(() => {
  const raw = this.fullRevenue();
  const start = this.value();
  const end = this.highValue();

  const filtered = raw
    .filter(d => {
      const ts = new Date(d.date).getTime();
      return ts >= start && ts <= end;
    })
    // Defensive: only keep entries with valid date and number
    .filter(d => !isNaN(new Date(d.date).getTime()) && typeof d.revenue === 'number');

  return [
    {
      name: 'Revenue',
      series: filtered.map(d => ({
        name: new Date(d.date).toLocaleDateString(), // format date to a readable string
        value: d.revenue
      }))
    }
  ];
});

  view: [number, number] = [700, 350];
  showXAxis = true;
  showYAxis = true;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;

  constructor() {
    this.fetchSales();
    this.fetchRevenue();
  }

  fetchSales() {
    this.http
      .get<{ name: string; value: number }[]>(apiUrl + '/dashboard/sales')
      .subscribe(data => {
        this.salesData.set(data);
      });
  }

  fetchRevenue() {
    this.http
      .get<{ date: string; revenue: number }[]>(apiUrl + '/dashboard/revenue')
      .subscribe(data => {
        this.fullRevenue.set(data);

        const timestamps = data.map(d => new Date(d.date).getTime());
        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);

        this.minTimestamp.set(min);
        this.maxTimestamp.set(max);
        this.value.set(min);
        this.highValue.set(max);

        this.sliderOptions = {
          ...this.sliderOptions,
          floor: min,
          ceil: max
        };
      });
  }

  // getters and setters for the two-way bound slider values
  get valueProp() {
    return this.value();
  }
  set valueProp(val: number) {
    this.value.set(val);
  }

  get highValueProp() {
    return this.highValue();
  }
  set highValueProp(val: number) {
    this.highValue.set(val);
  }
}
