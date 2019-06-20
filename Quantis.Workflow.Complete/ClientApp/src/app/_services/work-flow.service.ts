import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import Headers from '../_helpers/headers';
import {environment} from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {

  constructor(
    private http: HttpClient
  ) { }
  
  getAllTickets(): Observable<any>{
    const allTicketsEndPoint = `${environment.API_URL}/sdm/GetAllTickets`;
    return this.http.get(allTicketsEndPoint, Headers.setHeaders('GET'));
  }

  getAttachmentsByTicket(ticketId): Observable<any>{
    const ticketAttachmentEndPoint = `${environment.API_URL}/sdm/GetAttachmentsByTicket`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    return this.http.get(ticketAttachmentEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

  getTicketHistory(ticketId): Observable<any>{
    const ticketHistoryEndPoint = `${environment.API_URL}/sdm/GetTicketHistory`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    return this.http.get(ticketHistoryEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

  downloadAttachment(): Observable<any>{
    const allTickets = 'assets/tempData/DownloadAttachment.json';
    return this.http.get(allTickets);
  }
}
