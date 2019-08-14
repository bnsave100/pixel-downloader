import { Page } from '../models/page';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Cheerio = require('cheerio');
import RssToJson = require('rss-to-json');
import cloudscraper = require('cloudscraper');

export abstract class Site {

    public host: string;

    protected constructor(public readonly baseUrl: string,
                          protected pageSearchRequest: string,
                          protected readonly searchRequest: string[][],
                          protected readonly queryParameterName: string) {
        this.host = this.constructor.name;
    }

    public abstract search(query: string): Observable<Page[]>;

    public abstract getDetails(url: string): Observable<Page>;

    public abstract getRecents(): Observable<Page[]>;

    protected getSearchUrl(query: string): string {
        const searchRequest = this.searchRequest.slice(0);
        searchRequest.find(r => r[0] === this.queryParameterName)[1] = query;
        return this.getLinkWithBaseIfNeeded(this.pageSearchRequest) + '?' + searchRequest.map(r => r.join('=')).join('&');
    }
    
    protected findText(el): string {
        let text = [];
    
        if (el) {
            if (el.type === 'text') {
                text.push(el.data.trim().replace('(', '').replace(')', ''));
            } else if (el.children && el.children.length) {
                for (const i in el.children) {
                    text = text.concat(this.findText(el.children[+i]));
                }
            } else if (Array.isArray(el)) {
                for (const i in el) {
                    text = text.concat(this.findText(el[+i]));
                }
            }
        }
        return text.length > 0 ? text.join(' ').trim() : '';
    }
    
    protected runRequest(url: string): Observable<{} | CheerioStatic> {
        return new Observable<string>(observer => {
            cloudscraper.get(this.getLinkWithBaseIfNeeded(url)).then(data => observer.next(data), error => observer.error(error));
        }).pipe(
            map(data => Cheerio.load(data)),
            catchError(err => {
                console.error('url: ' + url, err);
                return throwError(err);
            })
        );
    }

    protected runRss(url: string): Observable<any[]> {
        return new Observable<any[]>(observer => {
            RssToJson.load(this.getLinkWithBaseIfNeeded(url), (err, res) => {
                if (err) {
                    console.error('url: ' + url, err);
                    observer.error(err);
                } else {
                    observer.next(res.items);
                }
                observer.complete();
            })
        });
    }

    public getLinkWithBaseIfNeeded(link: string): string {
        return link.startsWith('http') ? link : this.baseUrl + (link.startsWith('/') ? '' : '/') + link;
    }
}
