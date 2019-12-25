import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../constants/constants';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let r = req;
    const accessToken = localStorage.getItem(Constants.ACCESS_TOKEN);
    if (accessToken) {
      r = req.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
    return next.handle(r);
  }
}

