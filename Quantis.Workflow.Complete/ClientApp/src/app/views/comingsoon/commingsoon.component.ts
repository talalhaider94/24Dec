import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  templateUrl: './commingsoon.component.html',
})
export class CommingsoonComponent implements OnInit {
  public currentUser: any;
  public permissions = [];
  constructor(private authService: AuthService) {  }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.permissions = this.currentUser.permissions;
  }

}
