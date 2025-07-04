import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import { AlertService } from '../../../core/alerts/alert.service';
import { LoginService } from '../../../core/login/services/login.service';
import { MedicalRecordsService } from '../services/medical-records.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-records',
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.sass'
})
export class MedicalRecordsComponent {
  recordForm: FormGroup;
  editMode: boolean = false;

  selectedPetId: number = 0;
  arrVaccinations: any[] = [];
  arrEditVaccinations: any[] = [];

  public index: number = 1;
  public lstPetsType: any[] = [
    {id: 1, name: "Cat"},
    {id: 2, name: "Dog"},
    {id: 3, name: "Fish"},
    {id: 4, name: "Other"}
  ];
  public lstPetsSize: any[] = [
    {id: 1, name: "Small"},
    {id: 2, name: "Medium"},
    {id: 3, name: "Big"}
  ];
  public lstVaccinations: any[] = [
    {id: 1, name: "Rage"},
    {id: 2, name: "Distemper"},
    {id: 3, name: "Parvovirus"}
  ];

  constructor(private fb: FormBuilder, private alert: AlertService, private router: Router, private medical: MedicalRecordsService){    
    if (localStorage.getItem('token') === undefined) this.router.navigate(['login']);

    console.log(localStorage.getItem('token'));

    this.recordForm = this.fb.group({
      ownerName: ["", [Validators.required, Validators.maxLength(100), Validators.pattern("^[A-Za-zÀ-ÿÑñ \n]*$")]],
      petName: ["", [Validators.required, Validators.maxLength(100), Validators.pattern("^[A-Za-zÀ-ÿÑñ \n]*$")]],
      petType: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      petSize: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      description: ["", [Validators.required, Validators.maxLength(200), Validators.pattern("^[A-Za-zÀ-ÿÑñ0-9_ \n!¡()=¿?$%#.,/+*-]*$")]],

      numberVaccination: ["", [Validators.maxLength(50), Validators.pattern("^[A-Za-zÀ-ÿÑñ0-9_-]*$")]],
      typeVaccination: ["", [Validators.pattern("^[0-9]*$")]],
      dateVaccination: [""]
    });

    this.index = 1;
  }

  public vaccinationName(id:number): string {
    return this.lstVaccinations.filter((vaccination:any)=>{
      return vaccination.id == id;
    }).map((vaccination:any)=>{
      return vaccination.name
    }).toString();
  }

  private existVaccinations(id: string, arr: any[]) : boolean{
    let existVaccination = arr.filter((vaccination: any) => {
      return vaccination.number === id
    });

    return existVaccination.length > 0;
  }

  public addVaccinations(){
    if (this.recordForm.get('numberVaccination')?.invalid || this.recordForm.get('typeVaccination')?.invalid || this.recordForm.get('dateVaccination')?.invalid){
      this.alert.warning("The entered values ​​are invalid");
      return;
    }

    let numberVaccination = this.recordForm.get('numberVaccination')?.value;
    let typeVaccination = this.recordForm.get('typeVaccination')?.value;
    let dateVaccination = this.recordForm.get('dateVaccination')?.value; //year-month-day

    if (this.existVaccinations(numberVaccination, this.arrVaccinations) || this.existVaccinations(numberVaccination, this.arrEditVaccinations)) {
      this.alert.warning("The vaccine already exists");
    }else{
      this.arrVaccinations.push({number: numberVaccination, type: typeVaccination, date: dateVaccination});

      this.recordForm.patchValue({
        numberVaccination: "",
        typeVaccination: "",
        dateVaccination: ""
      });
    }
  }

  public deleteVaccinations(idMode:number, id: string){
    let removeVaccinations = function(arr: any[]) {
      const res = arr.filter((vaccination:any) =>{
        return vaccination.number !== id;
      });
      return res;
    }

    if (idMode === 1) this.arrVaccinations = removeVaccinations(this.arrVaccinations)
    else if (idMode === 2) this.arrEditVaccinations = removeVaccinations(this.arrEditVaccinations);
  }

  
  public createVaccinations() {
    if (this.recordForm.invalid) {
      this.alert.warning("Validate the information entered");
      return;
    }
    this.medical.create(this.recordForm.value, this.arrVaccinations);
    
    
    Swal.showLoading();
    this.medical.create(this.recordForm.value, this.arrVaccinations).subscribe((res:any) => {
      Swal.close();
      this.alert.success("The record was created")
    },(err:any) => {
      Swal.close();
      this.alert.error("The record could not be created");
    });
  }

  get validOwner() { return this.recordForm.get('ownerName')!.valid && this.recordForm.get('ownerName')!.touched }
  get validPet() { return this.recordForm.get('petName')!.valid && this.recordForm.get('petName')!.touched }
  get validType() { return this.recordForm.get('petType')!.valid && this.recordForm.get('petType')!.touched }
  get validSize() { return this.recordForm.get('petSize')!.valid && this.recordForm.get('petSize')!.touched }
  get validDescription() { return this.recordForm.get('description')!.valid && this.recordForm.get('description')!.touched }

  get validNumberVaccination() { return this.recordForm.get('numberVaccination')!.valid && this.recordForm.get('numberVaccination')!.touched }
  get validTypeVaccination() { return this.recordForm.get('typeVaccination')!.valid && this.recordForm.get('typeVaccination')!.touched }
  get validDateVaccination() { return this.recordForm.get('dateVaccination')!.valid && this.recordForm.get('dateVaccination')!.touched }
}