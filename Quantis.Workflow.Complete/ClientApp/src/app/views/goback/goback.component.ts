import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './goback.component.html',
})
export class GobackComponent implements OnInit {
    constructor(
        private loc: Location,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.goBack();
    }

    ngOnInit() {
    }

    goBack() {
        this.loc.back();
    }
}
