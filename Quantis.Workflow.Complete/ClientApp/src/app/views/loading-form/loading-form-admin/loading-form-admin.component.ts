import { Component, OnInit, ViewChild, ElementRef, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient, HttpRequest, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap, map, last, catchError } from 'rxjs/operators';
import { FileUploader } from 'ng2-file-upload';
import { FormAttachments, FormField, UserSubmitLoadingForm, Form, FileUploadModel } from '../../../_models';
import * as moment from 'moment';
import { LoadingFormService, AuthService } from '../../../_services';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from "@angular/router";

export class FormClass {
  form_id: number;
  // form_body: json;
  form_body: any;
}
// means field control
export class ControlloCampo {
  min: any;
  max: any;
}
// means comparison check
export class ControlloConfronto {
  campo1: any = '';
  segno: string = '';
  campo2: any = '';
}

const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
  selector: 'app-loading-form-admin',
  templateUrl: './loading-form-admin.component.html',
  styleUrls: ['./loading-form-admin.component.scss']
})
export class LoadingFormAdminComponent implements OnInit {
  formId: string = null;
  formName: string = null;
  loading: boolean = false;
  public listaKpiPerForm = [];
  defaultFont = [];
  public myInputForm: FormGroup;
  private files: Array<FileUploadModel> = [];
// for filters use of arrays to be able to declare e
// save several module variables, in this way
// I index and make possible the dynamism of the filter fields
// I use it for both i numbers and strings
  numeroMax: number[] = [];
  numeroMin: number[] = [];
  // filto per le date
  maxDate: any[] = [];
  minDate: any[] = [];

  dt: any[] = [];
  numero: number[] = [];
  stringa: string[] = [];
  daje: boolean = false;

  isAdmin: boolean = false;

  erroriArray: string[] = [];
  arraySecondo = new Array;
  confronti: string[] = ['<', '>', '=', '!=', '>=', '<='];
  dataSource = new MatTableDataSource();
  pageSizeOptions: number[] = [5, 10, 25, 100];
  mostraTabella: boolean = false;
  vai: boolean = false;
  arrayFormElements: any = [];

  jsonForm: any = [];

  numeroForm: number;
  title: string = '';
  checked: boolean;


  /** Link text */
  @Input() text = 'Upload';
  /** Name used in form which will be sent in HTTP request. */
  @Input() param = 'file';
  /** Target URL for file uploading. */
  @Input() target = 'https://file.io';
  /** File extension that accepted, same as 'accept' of <input type="file" />. 
      By the default, it's set to 'image/*'. */
  @Input() accept = 'image/*';
  /** Allow you to add handler after its completion. Bubble up response text from remote. */
  @Output() complete = new EventEmitter<string>();


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("filtro") filtro: ElementRef;

  angForm: FormGroup;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private loadingFormService: LoadingFormService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getUser();
    this.isAdmin = currentUser.isadmin;
    //this.tornaIndietro(); // means come back
    this.activatedRoute.paramMap.subscribe(params => {
      this.formId = params.get("formId");
      this.formName = params.get("formName");
      this.prendiDatiForm(+this.formId, this.formName);
    });
  }
  initInputForm() {
    return this.fb.group({
      valoreUtente: [''], // user value
      valoreMin: [''], // min value
      valoreMax: [''] // max value
    })
  }

  addInputForm() {
    console.log('addInputForm this.myInputForm 1', this.myInputForm);
    const control = <FormArray>this.myInputForm.controls['valories'];
    control.push(this.initInputForm());
  }

  initComparisonForm(array) {
    return this.fb.group({
      campo1: [{ value: array.campo1, disabled: false }], // means field
      segno: [{ value: array.segno, disabled: false }],
      campo2: [{ value: array.campo2, disabled: false }]
    })
  }

  addComparisonForm(array) {
    if (array == '') {
      array = new ControlloConfronto;
    }
    const control = <FormArray>this.myInputForm.controls['campiConfronto']; // means comparison fields
    control.push(this.initComparisonForm(array));
  }

  removeComparisonForm(i: number) {
    const control = <FormArray>this.myInputForm.controls['campiConfronto'];
    control.removeAt(i);
  }


  save(model: any) {
    if (!!model.value.termsCheck) {
      this.toastr.info('Inserire nota per dati non pervenuti.')
    }
    this.loading = true;
    console.log('ADMIN FORM SAVE MODEL', model.value);
    //elementi da mettere nel json
    // items to put in the json
    // let jsonDaPassare:json;
    let jsonDaPassare: any; // means json to pass
    let arrayControlli = []; // controls array
    // confrontoAppoggio = means comparison support || ControlloConfronto = means comparison check
    let confrontoAppoggio = new ControlloConfronto;
    let controlloCampo = new ControlloCampo; //means fields control

    this.erroriArray = [];
    let indiceAppoggio; // mean index support 
    let tipo1; // means guy or tip :/
    let valore1; // means value
    let valore2;
    // datiModelConfronto means  DataModel Comparison
    // campiConfronto means comparison fields
    let datiModelConfronto = model.value.campiConfronto;

    datiModelConfronto.forEach((element, index) => {
      console.log('why here....')
      if (element.campo1 != null && element.segno != null && element.campo2 != null) {
        confrontoAppoggio = new ControlloConfronto;
        confrontoAppoggio.campo1 = element.campo1;
        confrontoAppoggio.segno = element.segno;
        confrontoAppoggio.campo2 = element.campo2;
        arrayControlli.push(confrontoAppoggio);
        tipo1 = element.campo1.Type;
        indiceAppoggio = this.arrayFormElements.findIndex(x => x.name == element.campo1.Name);
        console.log(this.arrayFormElements);
        switch (tipo1) {
          case 'string':
            valore1 = this.stringa[indiceAppoggio];
            valore2 = this.stringa[this.arrayFormElements.findIndex(x => x.name == datiModelConfronto[index].campo2.Name)];
            break;

          case 'time':
            valore1 = this.dt[indiceAppoggio];
            valore2 = this.dt[this.arrayFormElements.findIndex(x => x.name == datiModelConfronto[index].campo2.Name)];
            break;

          default:
            valore1 = this.numero[indiceAppoggio];
            valore2 = this.numero[this.arrayFormElements.findIndex(x => x.name == datiModelConfronto[index].campo2.Name)];
            break;
        }
        this.checkConfronto(valore1, valore2, datiModelConfronto[index].segno, element.campo1, element.campo2);

        return;
      }

    });
    if (this.erroriArray.length > 0) {
      this.toastr.error('Please fill the form correctly.', 'Error');
      return;
    } else {
      console.log('NO ERRORS IN FORMS');
      this.arrayFormElements.forEach((element, index) => {
        console.log('arrayFormElements :', element);
        controlloCampo = new ControlloCampo;
        if (element.type == 'time') {
          controlloCampo.max = this.maxDate[index];
          controlloCampo.min = this.minDate[index];

        } else {
          controlloCampo.max = this.numeroMax[index];
          controlloCampo.min = this.numeroMin[index];
        }
        arrayControlli.push(controlloCampo);
        console.log('controlloCampo', controlloCampo);
      });
    }
    console.log('arrayControlli :', arrayControlli);
    var formToSend = new Form;
    formToSend.form_id = this.numeroForm;
    formToSend.form_body = JSON.stringify(arrayControlli);
    console.log('FINAL SENDING FORM', formToSend);
    this.loadingFormService.createForm(formToSend).subscribe(data => {

      this.toastr.success('Form has been submitted', 'Success');
      console.log('FINAL CREATE FORM SUCCESS', data);
      this.loading = false;
      this.router.navigate(['/loading-form/admin']);
    }, error => {
      this.toastr.error(error.message, 'Error');
      console.error('FINAL CREATE FORM ERROR', error);
      this.loading = false;
    });
  }
  // means check comparison
  // segno means sign
  checkConfronto(val1, val2, segno, elemento1, elemento2) {
    console.log('checkConfronto val1', val1);
    console.log('checkConfronto val2', val2);
    console.log('checkConfronto segno', segno);
    console.log('checkConfronto elemento1', elemento1);
    console.log('checkConfronto elemento2', elemento2);
    switch (segno) {
      case '=':
        if (val1 == val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere uguale a " + elemento2.Name);
        }
        break;
      case '!=':
        if (val1 != val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere diverso di " + elemento2.Name);
        }
        break;
      case '<':
        if (val1 < val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere minore di " + elemento2.Name);
        }
        break;
      case '>':
        if (val1 > val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere maggiore di " + elemento2.Name);
        }
        break;
      case '>=':
        if (val1 >= val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere maggiore o uguale a " + elemento2.Name);
        }
        break;
      case '<=':
        if (val1 <= val2) {

        } else {
          this.erroriArray.push(elemento1.Name + " deve essere minore o uguale a " + elemento2.Name);
        }
        break;
    }
  }
  // means take data forms
  // Danial: this method is invoked when a row is clicked.
  // and generates form fields dynamically
  prendiDatiForm(numero: number, nome: string) {
    this.loading = true;
    const currentUser = this.authService.getUser();
    // since I put the filters first by comparison,
    // when the max and min filters go I go to
    // subtract the number of past comparisons from the index
    let contatore = 0; // counter
    // camp means field and segno means sign
    let array = { 'campo1': '', 'segno': '', 'campo2': '' };
    this.title = nome;

    this.myInputForm = this.fb.group({
      // means values
      valories: this.fb.array([
        this.initInputForm()
      ]),
      // means comparison fields
      campiConfronto: this.fb.array([
        //this.initComparisonForm(array)
      ]),
      termsCheck: '',
    });

    this.loadingFormService.getKpiByFormId(numero).subscribe(data => {

      console.log('getKpiByFormId', data);
      if (!!data && typeof data === "object" && !Array.isArray(data)) {
        this.listaKpiPerForm.push(data);
      } else if (!!data && Array.isArray(data)) {
        data.forEach(element => {
          this.listaKpiPerForm.push(element);
        });
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      setTimeout(() => this.toastr.error(error.error.error.message, 'KPI Form Error'), 2000);
      console.log('getKpiByFormId', error)
    });

    this.loadingFormService.getFormRuleByFormId(numero).subscribe(data => {
      this.loading = false;
      console.log('getFormRuleByFormId', data);
      if(data) {
        JSON.parse(data.form_body).forEach((element, index) => {
          console.log(element);
          if (element.campo1 != null) {
            contatore++;
            array.campo1 = element.campo1;
            array.segno = element.segno;
            array.campo2 = element.campo2;
            this.defaultFont[index] = array;
            this.addComparisonForm(array);
          } else if (element.max != null && element.max.length != 24) {
            console.log(element.max);
            console.log(typeof element.max === "string");
            this.numeroMax[index - contatore] = element.max;
            this.numeroMin[index - contatore] = element.min;
          } else if (element.max != null && element.max.length == 24) {
            this.maxDate[index - contatore] = element.max;
            this.minDate[index - contatore] = element.min;
          }
        });
      }

    }, error => {
      this.loading = false;
      setTimeout(() => this.toastr.error(error.error.error.message, 'Form Rule Error'), 0);
      console.log('getFormRuleByFormId', error)
    });
    // if there are no filters for this form I create an empty field
    //array=={'campo1':'','segno':'','campo2':''}?this.initComparisonForm(array):'';
    if (array.campo1 == "" && array.segno == "" && array.campo2 == "") {
      this.initComparisonForm(array);
      console.log('IF FIELDS ARE EMPTY:', array);
    } else {
      console.log(array);
    }
    
    this.loadingFormService.getFormById(numero).subscribe(data => {
      this.loading = false;
      this.jsonForm = data;
      console.log('DYNAMIC FORM FIELDS : jsonForm', this.jsonForm);
      this.arrayFormElements = this.jsonForm[0].reader_configuration.inputformatfield;
      console.log('this.arrayFormElements', this.arrayFormElements);
      for (let i = 0; i < this.arrayFormElements.length - 1; i++) {
        this.addInputForm();
      }
      console.log('AFTER VALORIES LOOP', <FormArray>this.myInputForm.controls['valories']);
      this.numeroForm = numero;
    }, error => {
      this.loading = false;
      this.toastr.error(error.error.message, 'Error')
      console.log('getFormById', error)
    });

  }
}
