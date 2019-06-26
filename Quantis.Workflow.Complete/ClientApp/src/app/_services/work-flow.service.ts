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
    return this.http.get('assets/tempData/getalltickets.json');
    //return this.http.get(allTicketsEndPoint, Headers.setHeaders('GET'));
  }

  getTicketByUser(username): Observable<any> {
    //Danial TODO: need to send Login Token in HEADERS
    const userTicketsEndPoint = `${environment.API_URL}/sdm/GetTicketsByUser`;
    const  params = new  HttpParams().set('username', username);
    return this.http.get(userTicketsEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }
 
  getAttachmentsByTicket(ticketId): Observable<any>{
    const ticketAttachmentEndPoint = `${environment.API_URL}/sdm/GetAttachmentsByTicket`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    return this.http.get('assets/tempData/GetAttachmentsByTicket.json');
    //return this.http.get(ticketAttachmentEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

  getTicketHistory(ticketId): Observable<any>{
    const ticketHistoryEndPoint = `${environment.API_URL}/sdm/GetTicketHistory`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    // return this.http.get('assets/tempData/GetTicketHistory.json');
    return this.http.get(ticketHistoryEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

  downloadAttachment(attachmentHandler): Observable<any>{
    const downloadAttachmentEndPoint = `${environment.API_URL}/sdm/DownloadAttachment`;
    const  params = new  HttpParams().set('attachmentHandle', attachmentHandler);
    return this.http.get(downloadAttachmentEndPoint, { headers: Headers.setHeaders('GET').headers, params });
    // return this.http.get('assets/tempData/DownloadAttachment.json');
  }
  
  getTicketDescriptionByUser(username): Observable<any>{
    // no end point found in controller
    const getFormRuleByFormIdEndPoint = `${environment.API_URL}/sdm/GetTicketDescriptionByUser/${username}`;
    return this.http.get(getFormRuleByFormIdEndPoint, Headers.setHeaders('GET'));
  }
  
  transferTicketByID(id, status, description) {
    const transferTicketEndPoint = `${environment.API_URL}/sdm/TransferTicketByID`;
    const  params = new  HttpParams().set('id', id).set('status', status).set('description', description);
    return this.http.get(transferTicketEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

  escalateTicketbyID(id, status, description) {
    const escalateTicketEndPoint = `${environment.API_URL}/sdm/EscalateTicketbyID`;
    const  params = new  HttpParams().set('id', id).set('status', status).set('description', description);
    return this.http.get(escalateTicketEndPoint, { headers: Headers.setHeaders('GET').headers, params });
  }

}
