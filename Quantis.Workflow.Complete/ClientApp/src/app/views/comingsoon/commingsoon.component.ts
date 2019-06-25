import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services';

@Component({
  templateUrl: './commingsoon.component.html',
})
export class CommingsoonComponent implements OnInit {
  public currentUser: any;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    console.log(this.currentUser)
  }

}
