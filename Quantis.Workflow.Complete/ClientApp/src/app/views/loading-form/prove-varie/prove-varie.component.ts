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
import { FileSaverService } from 'ngx-filesaver';

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
  selector: 'app-prove-varie',
  templateUrl: './prove-varie.component.html',
  styleUrls: ['./prove-varie.component.scss']
})
export class ProveVarieComponent implements OnInit {
  formId: string = null;
  formName: string = null;
  formRulesBody: [] = [];
  loading: boolean = false;
  displayUserFormCheckBox: boolean = false;
  formAttachmentsArray: any = [];
  userLoadingFormErrors: string[] = [];

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
  //vai:boolean = true;
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


  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  // @ViewChild("filtro") filtro: ElementRef;

  angForm: FormGroup;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private loadingFormService: LoadingFormService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private _FileSaverService: FileSaverService
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getUser();
    this.isAdmin = currentUser.isadmin;
    this.activatedRoute.paramMap.subscribe(params => {
      this.formId = params.get("formId");
      this.formName = params.get("formName");
      this._init(+this.formId, this.formName);
      this._getAttachmentsByFormIdEndPoint(+this.formId);
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

  saveUser(model: any) {
    if (!!model.value.termsCheck) {
      this.toastr.info('Inserire nota per dati non pervenuti.')
    }
    var formFields: FormField;
    var userSubmit: UserSubmitLoadingForm = new UserSubmitLoadingForm();
    var dataAttuale = new Date();
    dataAttuale.setMonth((dataAttuale.getMonth()) - 1);
    if (dataAttuale.getMonth() == 12) {
      dataAttuale.setFullYear(dataAttuale.getFullYear() - 1);
    }
    var periodRaw = moment(dataAttuale).format('MM/YY');
    const errorArray = this._customFormRulesValidation(this.arrayFormElements, model.value.valories, this.formRulesBody);
    if (errorArray.length > 0) {
      this.userLoadingFormErrors = errorArray;
      this.toastr.error('Form fields data is not valid');
      return false;
    } else {
      this.userLoadingFormErrors = [];
    }

    //part where I fill in field values
    this.arrayFormElements.forEach((element, index) => {
      formFields = new FormField;
      formFields.FieldName = element.name;
      formFields.FieldType = element.type;
      switch (element.type) {
        case 'time':
          formFields.FieldValue = this.dt[index];
          break;
        case 'string':
          formFields.FieldValue = this.stringa[index];
          break;
        default:
          // for real and integer
          formFields.FieldValue = String(this.numero[index]);
          break;
      }
      userSubmit.inputs.push(formFields);
    });
    this.popolaUserSubmit(periodRaw, dataAttuale, userSubmit);
  }
  // means populates User Submit
  popolaUserSubmit(periodRaw: any, dataAttuale, userSubmit) {
    this.loading = true;
    const currentUser = this.authService.getUser();
    userSubmit.locale_id = currentUser.localeid;
    userSubmit.form_id = +this.numeroForm;
    userSubmit.user_id = currentUser.userid;
    userSubmit.empty_form = false;
    userSubmit.period = String(periodRaw);
    userSubmit.year = Number(moment(dataAttuale).format('YY'));
    this.loadingFormService.submitForm(userSubmit).subscribe(data => {
      this.loading = false;
      console.log('USER FORM SUBMIT SUCCESS', data);
      if (!data) {
        this.toastr.error('There was an error while submitting form', 'Error');
        return;
      } else {
        this.toastr.success('Form has been submitted successfully.', 'Success');
      }
    }, error => {
      this.loading = false;
      console.log('USER FORM SUBMIT ERROR', error);
      this.toastr.error(error.error.error, 'Error');
    });
  }
  // means check comparison
  // segno means sign
  // checkConfronto(val1, val2, segno, elemento1, elemento2) {
  //   console.log('checkConfronto val1', val1);
  //   console.log('checkConfronto val2', val2);
  //   console.log('checkConfronto segno', segno);
  //   console.log('checkConfronto elemento1', elemento1);
  //   console.log('checkConfronto elemento2', elemento2);
  //   switch (segno) {
  //     case '=':
  //       if (val1 == val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere uguale a " + elemento2.Name);
  //       }
  //       break;
  //     case '!=':
  //       if (val1 != val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere diverso di " + elemento2.Name);
  //       }
  //       break;
  //     case '<':
  //       if (val1 < val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere minore di " + elemento2.Name);
  //       }
  //       break;
  //     case '>':
  //       if (val1 > val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere maggiore di " + elemento2.Name);
  //       }
  //       break;
  //     case '>=':
  //       if (val1 >= val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere maggiore o uguale a " + elemento2.Name);
  //       }
  //       break;
  //     case '<=':
  //       if (val1 <= val2) {

  //       } else {
  //         this.erroriArray.push(elemento1.Name + " deve essere minore o uguale a " + elemento2.Name);
  //       }
  //       break;
  //   }
  // }

  // generates form fields dynamically
  _init(numero: number, nome: string) {
    this.loading = true;
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
      this.toastr.error(error.error.error.message, 'KPI Form Error');
      console.log('getKpiByFormId', error)
    });

    this.loadingFormService.getFormRuleByFormId(numero).subscribe(data => {
      this.loading = false;
      console.log('getFormRuleByFormId', data);
      if (data) {
        this.formRulesBody = JSON.parse(data.form_body);
        JSON.parse(data.form_body).forEach((element, index) => {
          console.log('data.form_body element', element);
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
      this.toastr.error(error.error.error.message, 'Form Rule Error');
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
      this.arrayFormElements = data[0].reader_configuration.inputformatfield;
      console.log('this.arrayFormElements', this.arrayFormElements);
      for (let i = 0; i < this.arrayFormElements.length - 1; i++) {
        this.addInputForm();
      }
      this.numeroForm = numero;
      // CHECK BOX DISPLAY CONDITION START
      const checkboxFieldExists = this.arrayFormElements.find(field => field.name === 'Dato_Mancante' && field.type === 'integer');
      if (checkboxFieldExists) {
        this.displayUserFormCheckBox = true;
      }
      // CHECK BOX DISPLAY CONDITION END
    }, error => {
      this.loading = false;
      this.toastr.error(error.error.message, 'Error')
      console.log('getFormById', error)
    });

  }

  // means filter elements
  filtraElementi(campo, indice: number) {
    console.log('FILTER ELEMENTS', campo);
    let arrayappoggio = new Array(this.arrayFormElements);
    console.log(this.arraySecondo);
    this.arraySecondo[indice] = arrayappoggio.filter(
      elemento => (elemento.Type === campo.Type) && (elemento.Name != campo.Name));
    console.log(this.arraySecondo);
  }

  fileData = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
  }


  cancelFile(file: FileUploadModel) {
    this.removeFileFromArray(file);
  }

  cancelFile1(file: FileUploadModel) {
    this.removeFileFromArray(file);
  }

  // retryFile(file: FileUploadModel) {
  //   this.uploadFile(file);
  //   file.canRetry = false;
  // }

  // private uploadFile(file: FileUploadModel) {
  //   const fd = new FormData();
  //   fd.append(this.param, file.data);

  //   const req = new HttpRequest('POST', this.target, fd, {
  //     reportProgress: true
  //   });

  //   file.inProgress = true;
  //   file.sub = this.http.request(req).pipe(
  //     map(event => {
  //       switch (event.type) {
  //         case HttpEventType.UploadProgress:
  //           file.progress = Math.round(event.loaded * 100 / event.total);
  //           //console.log('ciaone');
  //           break;
  //         case HttpEventType.Response:
  //           // console.log('non saprei');
  //           return event;
  //       }
  //     }),
  //     tap(message => { }),
  //     last(),
  //     catchError((error: HttpErrorResponse) => {
  //       file.inProgress = false;
  //       file.canRetry = true;
  //       return of(`${file.data.name} upload failed.`);
  //     })
  //   ).subscribe(
  //     (event: any) => {
  //       if (typeof (event) === 'object') {
  //         this.removeFileFromArray(file);
  //         this.complete.emit(event.body);
  //       }
  //     }
  //   );
  // }

  // private uploadFiles() {
  //   const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
  //   fileUpload.value = '';

  //   this.files.forEach(file => {
  //     this.uploadFile(file);
  //   });
  // }

  private removeFileFromArray(file: FileUploadModel) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  public uploader: FileUploader = new FileUploader({ url: URL });
  // public hasBaseDropZoneOver: boolean = false;
  // public hasAnotherDropZoneOver: boolean = false;

  // public fileOverBase(e: any): void {
  //   this.hasBaseDropZoneOver = e;
  // }

  // public fileOverAnother(e: any): void {
  //   this.hasAnotherDropZoneOver = e;
  // }


  _getAttachmentsByFormIdEndPoint(formId: number) {
    this.loadingFormService.getAttachmentsByFormId(formId).pipe().subscribe(data => {
      console.log('_getAttachmentsByFormIdEndPoint ==>', data);
      if (data) {
        this.formAttachmentsArray = data;
      }
    }, error => {
      console.error('_getAttachmentsByFormIdEndPoint ==>', error);
      this.toastr.error('Error while fetching form attachments.');
    })
  }

  _customFormRulesValidation(formElements, formValues, formRules) {
    const mapFormValues = formValues.map((value, index) => {
      return {
        name: formElements[index].name,
        type: formElements[index].type,
        value: value.valoreUtente || ''
      }
    });
    const inValidRulesArray = mapFormValues.filter((value, index) => {
      if (value.type === 'string') {
        let rule = formRules[index];
        let ruleMin = rule.min || 0;
        let ruleMax = rule.max || 100;
        const formStringValue = value.value;
        console.log('formStringValue', formStringValue);
        if (formStringValue.length >= ruleMin && formStringValue.length <= ruleMax) {
          return false;
        } else {
          return true;
        }
      } else if (value.type === 'time') {
        const formDateValue = value.value;
        const minDate = moment(formRules[index].min);
        const maxDate = moment(formRules[index].max);
        let isBetween = moment(formDateValue).isBetween(minDate, maxDate);
        return isBetween ? false : true;
      } else if (value.type === 'real') {
        let rule = formRules[index];
        let ruleMin = rule.min || 0;
        let ruleMax = rule.max || 100;
        const formRealValue = value.value;
        if (formRealValue >= ruleMin && formRealValue <= ruleMax) {
          return false;
        } else {
          return true;
        }
      } else {
        console.log('VALIDATION NOT HANDLES FOR VALUE', value);
      }
    });
    return inValidRulesArray.map(invalidField => {
      return `${invalidField.name} Input is not valid`;
    })
  }

  downloadFile(base64Data, fileName) {
    // let prefix = `data:application/pdf;base64,${base64Data}`;
    this._FileSaverService.save(base64Data, fileName);
  }

  fileUploadUI() {
    if (this.uploader.queue.length > 0) {
      console.log('this.uploader', this.uploader);
      this.uploader.queue.forEach((element, index) => {
        let file = element._file;
        this._getUploadedFile(file);
      });
    } else {
      this.toastr.info('Please upload a file');
    }
  }

  _getUploadedFile(file) {
    const reader:FileReader = new FileReader();
    // reader.onload = this._handleReaderLoaded.bind(this);
    reader.onloadend = (function(theFile, loadingFormService, formId){
      let fileName = theFile.name;
      return function(readerEvent){
        let formAttachments:FormAttachments = new FormAttachments();
        let binaryString = readerEvent.target.result;
        let base64Data = btoa(binaryString);  
        formAttachments.content = base64Data;
        formAttachments.form_attachment_id = 0;
        formAttachments.form_id = formId;
        formAttachments.period = '9';
        formAttachments.year = 2019;
        formAttachments.doc_name = fileName;
        formAttachments.checksum = 'checksum';
        loadingFormService.submitAttachment(formAttachments).pipe().subscribe(data => {
          debugger
        }, error => {
          debugger
        })   
      };
  })(file, this.loadingFormService, +this.formId);
    reader.readAsBinaryString(file);
  }

  // _handleReaderLoaded(readerEvt) {
  //   let formAttachments: FormAttachments;
  //   let binaryString = readerEvt.target.result;
  //   let base64Data = btoa(binaryString)
  //   formAttachments.content = base64Data;
  //   formAttachments.form_attachment_id = new Date().getTime();
  //   formAttachments.form_id = +this.formId;
  //   formAttachments.period = '';
  //   formAttachments.year = 0;
  //   formAttachments.doc_name = '';
  //   formAttachments.checksum = '';
  //   return btoa(binaryString);  
  // }
  // Danial: Below code is working But putting on hold
  // changeListener($event) : void {
  //   this.readThis($event.target);
  // }
  
  // readThis(inputValue: any): void {
  //   var file:File = inputValue.files[0];
  //   debugger
  //   var myReader:FileReader = new FileReader();
  
  //   myReader.onloadend = (e) => {
  //     console.log('dd',myReader.result);
  //     let formAttachments:FormAttachments = new FormAttachments();
  //     // var userSubmit: UserSubmitLoadingForm = new UserSubmitLoadingForm();
  //     // debugger        
  //     formAttachments.content = myReader.result;
  //     formAttachments.form_attachment_id = new Date().getTime();
  //     formAttachments.form_id = +this.formId;
  //     formAttachments.period = '';
  //     formAttachments.year = 0;
  //     formAttachments.doc_name = '';
  //     formAttachments.checksum = '';
  //     this.loadingFormService.submitAttachment(formAttachments).pipe().subscribe(data => {
  //       debugger
  //     }, error => {
  //       debugger
  //     }) 
  //     // this.image = myReader.result;
      
  //   }
  //   myReader.readAsDataURL(file);
  // }
}
