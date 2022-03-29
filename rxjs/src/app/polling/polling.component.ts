import { fromEvent, Observable, partition, repeatWhen, switchMapTo, takeUntil, tap, timer } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { PollingService } from '../services/polling.service';

@Component({
  selector: 'app-polling',
  templateUrl: './polling.component.html',
})
export class PollingComponent implements OnInit {
  catUrl$?: Observable<any>;

  constructor(private dataService: PollingService) {}

  ngOnInit(): void {
    const onVisibilityChange$ = fromEvent(document, 'visibilitychange');

    const [pageVisible$, pageHidden$] = partition(onVisibilityChange$, () => document.visibilityState === 'visible');
    const catAPI$ = this.dataService.getCats();

    this.catUrl$ = timer(0, 5000).pipe(
      tap((t) => console.log(t)),
      switchMapTo(catAPI$),
      takeUntil(pageHidden$),
      tap((e) => console.log(e[0].id)),
      repeatWhen(() => pageVisible$)
      );
  }
}
