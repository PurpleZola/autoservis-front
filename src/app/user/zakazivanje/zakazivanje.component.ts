import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DayHeaderContentArg, EventClickArg, EventMountArg } from '@fullcalendar/core';
import type { VerboseFormattingArg } from '@fullcalendar/core/internal';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TerminService } from '../../services/termin.service';
import { VozilaService } from '../../services/vozila.service';
import { CurrentKlijentService } from '../../services/current-klijent.service';
import { Termin } from '../../models/termin.model';
import { Vozilo } from '../../models/vozilo.model';
import {
  ZakazivanjeDialogComponent,
  ZakazivanjeDialogData
} from './zakazivanje-dialog/zakazivanje-dialog.component';
import {
  TerminDetaljiDialogComponent,
  TerminDetaljiDialogData
} from './termin-detalji-dialog/termin-detalji-dialog.component';

@Component({
  selector: 'app-zakazivanje',
  standalone: true,
  imports: [NgClass, FullCalendarModule, MatDialogModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './zakazivanje.component.html',
  styleUrl: './zakazivanje.component.scss'
})
export class ZakazivanjeComponent implements OnInit {
  private readonly terminService = inject(TerminService);
  private readonly vozilaService = inject(VozilaService);
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private klijentId: number | null = null;

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly termini = signal<Termin[]>([]);
  readonly vozila = signal<Vozilo[]>([]);

  private readonly dayNamesSr = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  private readonly monthNamesSr = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  readonly calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    // 'en' is FullCalendar's own built-in base locale (no external locale pack
    // involved), so the explicit `buttonText`/`dayHeaderContent`/`titleFormat`
    // overrides below are the only source of text - nothing competes with them.
    locale: 'en',
    buttonText: {
      today: 'Danas',
      month: 'Mjesec',
      week: 'Sedmica',
      day: 'Dan',
      list: 'Lista'
    },
    dayHeaderContent: (arg: DayHeaderContentArg) => this.dayNamesSr[arg.date.getDay()],
    titleFormat: (arg: VerboseFormattingArg) => this.formatTitleSr(arg),
    firstDay: 1,
    height: 'auto',
    eventDisplay: 'list-item',
    dateClick: (arg) => this.onDateClick(arg),
    eventClick: (arg) => this.onEventClick(arg),
    eventDidMount: (arg) => this.onEventDidMount(arg),
    events: []
  });

  ngOnInit(): void {
    this.loadTermini();
  }

  private loadTermini(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.currentKlijentService
      .getCurrentKlijent()
      .pipe(
        switchMap((klijent) => {
          if (!klijent?.id) return of(null);
          this.klijentId = klijent.id;
          return forkJoin({
            termini: this.terminService.getAll(),
            vozila: this.vozilaService.getAll()
          });
        })
      )
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (!result) return;

          const mojiTermini = result.termini
            .filter((t) => t.klijentId === this.klijentId)
            .sort((a, b) =>
              `${a.datumTermina}T${a.vrijemeTermina}`.localeCompare(`${b.datumTermina}T${b.vrijemeTermina}`)
            );
          const mojaVozila = result.vozila.filter((v) => v.klijentId === this.klijentId);

          this.termini.set(mojiTermini);
          this.vozila.set(mojaVozila);
          this.calendarOptions.update((opts) => ({
            ...opts,
            events: mojiTermini.map((t) => this.toEvent(t))
          }));
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Greška prilikom učitavanja termina.');
        }
      });
  }

  private toEvent(termin: Termin) {
    const boje = this.statusColors(termin.status);
    const vozilo = this.vozila().find((v) => v.id === termin.voziloId);
    const title = vozilo ? `${vozilo.marka} ${vozilo.model} - ${termin.opisProblema}` : termin.opisProblema;
    return {
      id: String(termin.id),
      title,
      start: `${termin.datumTermina}T${termin.vrijemeTermina}`,
      allDay: false,
      backgroundColor: boje.event,
      borderColor: boje.event,
      textColor: '#ffffff',
      classNames: ['termin-event'],
      extendedProps: { status: termin.status }
    };
  }

  private statusColors(status: string): { event: string; cellBackground: string } {
    switch (status) {
      case 'PRIHVACEN':
        return { event: '#2e7d32', cellBackground: '#e8f5e9' };
      case 'ODBIJEN':
        return { event: '#c62828', cellBackground: '#ffebee' };
      default:
        return { event: '#FF6600', cellBackground: '#fff3e0' };
    }
  }

  private onEventDidMount(arg: EventMountArg): void {
    const status = arg.event.extendedProps['status'] as string;
    const { cellBackground } = this.statusColors(status);

    const dayCell =
      arg.el.closest<HTMLElement>('.fc-daygrid-day') ?? arg.el.closest<HTMLElement>('.fc-timegrid-col');

    if (dayCell) {
      dayCell.style.backgroundColor = cellBackground;
    }
  }

  // FullCalendar always calls a function-based titleFormat via formatRange(),
  // passing the view's date range as `start`/`end` (end exclusive). For
  // month/year-granularity views `end` lands in the next period, so a large
  // day gap signals "single month" and we format from `start` alone; a small
  // gap signals a day/week view, where `end` (minus a day) is the last
  // visible day and we build a "start – end" range instead.
  private formatTitleSr(arg: VerboseFormattingArg): string {
    const start = arg.start;
    const end = arg.end;

    if (!end) {
      return `${this.monthNamesSr[start.month]} ${start.year}`;
    }

    const startUtc = Date.UTC(start.year, start.month, start.day);
    const endUtcExclusive = Date.UTC(end.year, end.month, end.day);
    const diffDays = Math.round((endUtcExclusive - startUtc) / 86400000);

    if (diffDays > 27) {
      return `${this.monthNamesSr[start.month]} ${start.year}`;
    }

    if (diffDays <= 1) {
      return `${start.day}. ${this.monthNamesSr[start.month]} ${start.year}.`;
    }

    const endInclusive = new Date(endUtcExclusive - 86400000);
    const endYear = endInclusive.getUTCFullYear();
    const endMonth = endInclusive.getUTCMonth();
    const endDay = endInclusive.getUTCDate();

    if (start.year !== endYear) {
      return (
        `${start.day}. ${this.monthNamesSr[start.month]} ${start.year}. – ` +
        `${endDay}. ${this.monthNamesSr[endMonth]} ${endYear}.`
      );
    }

    if (start.month !== endMonth) {
      return `${start.day}. ${this.monthNamesSr[start.month]} – ${endDay}. ${this.monthNamesSr[endMonth]} ${endYear}.`;
    }

    return `${start.day}. – ${endDay}. ${this.monthNamesSr[start.month]} ${start.year}.`;
  }

  private onDateClick(arg: DateClickArg): void {
    if (!this.klijentId) return;

    const clickedDate = new Date(arg.date.getFullYear(), arg.date.getMonth(), arg.date.getDate());
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (clickedDate < startOfToday) return;

    const dayOfWeek = clickedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    const klijentId = this.klijentId;
    const datum = arg.dateStr.slice(0, 10);
    const mojaVozila = this.vozila();

    const dialogRef = this.dialog.open<ZakazivanjeDialogComponent, ZakazivanjeDialogData, Termin>(
      ZakazivanjeDialogComponent,
      {
        width: '420px',
        panelClass: 'app-dialog-panel',
        data: { datum, vozila: mojaVozila, klijentId }
      }
    );

    dialogRef.afterClosed().subscribe((termin) => {
      if (!termin) return;

      this.loadTermini();
      this.snackBar.open('Termin uspješno zakazan!', 'OK', {
        duration: 3000,
        panelClass: ['app-success-snackbar']
      });
    });
  }

  private onEventClick(arg: EventClickArg): void {
    const terminId = Number(arg.event.id);
    const termin = this.termini().find((t) => t.id === terminId);
    if (!termin) return;

    const vozilo = this.vozila().find((v) => v.id === termin.voziloId) ?? null;

    const dialogRef = this.dialog.open<TerminDetaljiDialogComponent, TerminDetaljiDialogData, 'cancel'>(
      TerminDetaljiDialogComponent,
      {
        width: '420px',
        panelClass: 'app-dialog-panel',
        data: { termin, vozilo }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'cancel') {
        this.otkaziTermin(termin);
      }
    });
  }

  otkaziTermin(termin: Termin): void {
    if (!termin.id) return;

    this.terminService.delete(termin.id).subscribe({
      next: () => {
        this.loadTermini();
        this.snackBar.open('Termin otkazan', 'OK', { duration: 3000, panelClass: ['app-success-snackbar'] });
      },
      error: () => this.errorMessage.set('Greška prilikom otkazivanja termina.')
    });
  }
}
