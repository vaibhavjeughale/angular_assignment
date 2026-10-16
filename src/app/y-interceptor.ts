import { HttpInterceptorFn } from '@angular/common/http';

export const yInterceptor: HttpInterceptorFn = (req, next) => {

  const userToken = localStorage.getItem('token')
  const modifiedReq = req.clone({
     headers: req.headers.set('Authorization', `Bearer ${userToken}`),
   });

  return next(req);
};
