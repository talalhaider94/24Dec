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
    //return this.http.get('assets/tempData/getalltickets.json');
    return this.http.get(allTicketsEndPoint, Headers.setTokenHeaders('GET'));
  }

  getTicketByUser(username): Observable<any> {
    //Danial TODO: need to send Login Token in HEADERS
    const userTicketsEndPoint = `${environment.API_URL}/sdm/GetTicketsByUser`;
    const  params = new  HttpParams().set('username', username);
    return this.http.get(userTicketsEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
  }
 
  getAttachmentsByTicket(ticketId): Observable<any>{
    const ticketAttachmentEndPoint = `${environment.API_URL}/sdm/GetAttachmentsByTicket`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    // return this.http.get('assets/tempData/GetAttachmentsByTicket.json');
    return this.http.get(ticketAttachmentEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
  }

  getTicketHistory(ticketId): Observable<any>{
    const ticketHistoryEndPoint = `${environment.API_URL}/sdm/GetTicketHistory`;
    const  params = new  HttpParams().set('ticketId', ticketId.toString());
    // return this.http.get('assets/tempData/GetTicketHistory.json');
    return this.http.get(ticketHistoryEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
  }

  downloadAttachment(attachmentHandler): Observable<any>{
    const downloadAttachmentEndPoint = `${environment.API_URL}/sdm/DownloadAttachment`;
    const  params = new  HttpParams().set('attachmentHandle', attachmentHandler);
    return this.http.get(downloadAttachmentEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
    // return this.http.get('assets/tempData/DownloadAttachment.json');
  }
  
  getTicketDescriptionByUser(username): Observable<any>{
    // no end point found in controller
    const getFormRuleByFormIdEndPoint = `${environment.API_URL}/sdm/GetTicketDescriptionByUser/${username}`;
    return this.http.get(getFormRuleByFormIdEndPoint, Headers.setTokenHeaders('GET'));
  }
  
  transferTicketByID(id, status, description) {
    const transferTicketEndPoint = `${environment.API_URL}/sdm/TransferTicketByID`;
    const  params = new  HttpParams().set('id', id).set('status', status).set('description', description);
    return this.http.get(transferTicketEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
  }

  escalateTicketbyID(id, status, description) {
    const escalateTicketEndPoint = `${environment.API_URL}/sdm/EscalateTicketbyID`;
    const  params = new  HttpParams().set('id', id).set('status', status).set('description', description);
    return this.http.get(escalateTicketEndPoint, { headers: Headers.setTokenHeaders('GET').headers, params });
  }
  
  getTicketsVerificationByUserVerifica (period: string): Observable<any>{
    const ticketVerificationEndPoint = `${environment.API_URL}/sdm/GetTicketsVerificationByUser`;
    //return this.http.get('assets/tempData/getalltickets.json');
    const  params = new  HttpParams().set('period', period);
    return this.http.get(ticketVerificationEndPoint,{ headers: Headers.setTokenHeaders('GET').headers, params });
  }
  
  getTicketsSearchByUserRecerca (): Observable<any>{
    const ticketSearchEndPoint = `${environment.API_URL}/sdm/GetTicketsSearchByUser`;
    // return this.http.get('assets/tempData/getalltickets.json');
    return this.http.get(ticketSearchEndPoint, Headers.setTokenHeaders('GET'));
  }

  uploadAttachmentToTicket(ticketId, docName, docContent): Observable<any> {
    const submitAttachmentEndPoint = `${environment.API_URL}/sdm/UploadAttachmentToTicket`;
    const  params = new  HttpParams().set('ticketId', ticketId).set('docName', docName).set('docContent', docContent);
    return this.http.get(submitAttachmentEndPoint, { headers: Headers.setTokenHeaders('PUT').headers, params });
  }

}
