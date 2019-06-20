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
    const allTickets = 'assets/tempData/getalltickets.json';
    return this.http.get(allTickets);
  }

  getAttachmentsByTicket(): Observable<any>{
    const allTickets = 'assets/tempData/GetAttachmentsByTicket.json';
    return this.http.get(allTickets);
  }

  getTicketHistory(): Observable<any>{
    const allTickets = 'assets/tempData/GetTicketHistory.json';
    return this.http.get(allTickets);
  }

  downloadAttachment(): Observable<any>{
    const allTickets = 'assets/tempData/DownloadAttachment.json';
    return this.http.get(allTickets);
  }
}
