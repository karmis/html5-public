import * as moment from 'moment';
export class TimeProvider {
    public readonly epochTicks = 621355968000000000;
    public readonly ticksPerMillisecond = 10000;

    public getTimeZoneInGMT(date){
        let currentTimezone = date.getTimezoneOffset();
        currentTimezone = (currentTimezone/60) * -1;
        let utc = currentTimezone;
        if (currentTimezone !== 0)
        {
            utc = currentTimezone > 0 ? ' +' : ' ';
            utc += currentTimezone
        }

        return utc;
    }

    public getTimeInLocalTimeZone(d = new Date(), offset) {
        return d.getTime() + (3600000 * offset);
    }

    ticksToTimestamp(ticks: number) {
        return (ticks - this.epochTicks) / this.ticksPerMillisecond;
    };

    timeMMSSToTicks(date: Date) {
        return (date.getHours() * 60 * 60 * 1000 + date.getMinutes() * 60 * 1000 + date.getSeconds() * 1000) * this.ticksPerMillisecond;
    }

    ticksToTimeMMSS(ticks: number) {
        const ms = ticks / this.ticksPerMillisecond;
        const d = new Date();
        const hours = Math.floor((ms / (60000 * 60)) % 24);
        const minutes: number = Math.floor((ms / 60000) % 60);
        const seconds: number = parseInt(((ms % 60000) / 1000).toFixed(0));
        d.setHours(hours, minutes,seconds,0);
        return d;
    }

    timestampToTicks(timestamp: number) {
        return ((timestamp * this.ticksPerMillisecond) + this.epochTicks);
    }

    dateToLocalTimeZoneDate(date = new Date()):number {
        const timeZoneGMT = this.getTimeZoneInGMT(date);
        return this.getTimeInLocalTimeZone(date, timeZoneGMT);
    }

    dateToTicks(date: Date): number {
        return this.timestampToTicks(this.dateToLocalTimeZoneDate(date));
    }

    getDateInCurrentTimezone(d: Date): Date {
        return new Date(moment.utc(d.toISOString()).format('YYYY-MM-DD HH:mm:ss'));
    }
}
