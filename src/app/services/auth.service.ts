import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = `https://backend-funsport-6e9i.onrender.com/v1`;

  constructor(private httpClient: HttpClient) { }
  checkAdmin() {
    let jsonData = localStorage.getItem('login');
    if (jsonData) {
      if (JSON.parse(jsonData).admin == true) {
        return JSON.parse(jsonData)
      } else {
        return false
      }
    } else {
      return false
    }
  }

  checkLogin() {
    let jsonData = localStorage.getItem('login');
    if (jsonData) {
      return JSON.parse(jsonData)
    } else {
      return false
    }
  }
  isAdmin(): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      let jsonData = localStorage.getItem('login');
      if (jsonData) {
        if (JSON.parse(jsonData).admin == true) {
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    });
    return promise;
  }
  login(body: any) {
    return this.httpClient.post(`${this.url}/account/login`, body);
  }

  register(body: any) {
    return this.httpClient.post(`${this.url}/account/add`, body);
  }
}
