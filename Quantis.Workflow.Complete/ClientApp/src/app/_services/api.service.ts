import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import Headers from '../_helpers/headers';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCatalogoUsers(){
    return this.http.get('https://api.myjson.com/bins/p7x9t').pipe(
      tap(
        data => data,
        error => error
      )
    );
  }

  getCatalogoKpis(){
    return this.http.get('https://api.myjson.com/bins/1157o5')
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  getConfigurations() {
    return this.http.get('https://api.myjson.com/bins/13h29l')
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }


  getArchivedKpis() {
    return this.http.get('https://api.myjson.com/bins/lp589')
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateConfig(config) {
    return this.http.post('http://10.10.10.102/api/information/AddUpdateConfiguration', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogUtenti(config) {
    return this.http.post('http://10.10.10.102/api/data/AddUpdateUser', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogKpi(config) {
    return this.http.post('http://10.10.10.102/api/data/AddUpdateKpi', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }
}
