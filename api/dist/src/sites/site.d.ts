/// <reference types="cheerio" />
import { Page } from '../models/page';
import { Observable } from 'rxjs';

export declare abstract class Site {
    readonly baseUrl: string;
    protected pageSearchRequest: string;
    protected readonly searchRequest: string[][];
    protected readonly queryParameterName: string;
    host: string;

    protected constructor(baseUrl: string, pageSearchRequest: string, searchRequest: string[][], queryParameterName: string);

    abstract search(query: string): Observable<Page[]>;

    abstract getDetails(url: string): Observable<Page>;

    abstract getRecents(): Observable<Page[]>;

    protected getSearchUrl(query: string): string;

    protected findText(el: any): string;

    protected runRequest(url: string): Observable<{} | CheerioStatic>;

    protected runRss(url: string): Observable<any[]>;

    getLinkWithBaseIfNeeded(link: string): string;
}