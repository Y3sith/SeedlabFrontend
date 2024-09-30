class DashboardData {
    userCount: UsersData;
    promediosAsesoria: PromedioAsesoriaData;
    generosCount: GenerosData;
    registrosCount: RegistrosMensualesData;
    emprendedorDepCount: EmprendedorDepartamentoData;
  
    constructor({userCount, promediosAsesoria, generosCount, registrosCount, emprendedorDepCount}: 
      {userCount: UsersData, promediosAsesoria: PromedioAsesoriaData, generosCount: GenerosData, registrosCount: RegistrosMensualesData, emprendedorDepCount: EmprendedorDepartamentoData}) {
      this.userCount = userCount;
      this.promediosAsesoria = promediosAsesoria;
      this.generosCount = generosCount;
      this.registrosCount = registrosCount;
      this.emprendedorDepCount = emprendedorDepCount;
    }
  }
  

class UsersData{
    totalUsuarios: any[];
    totalSuperAdmin: number;
    totalOrientador: number;
    totalAliado: number;
    totalAsesor: number;
    totalEmprendedor: number;
    topAliados: {};

    constructor({totalUsuarios, totalSuperAdmin, totalOrientador, totalAliado, totalAsesor, totalEmprendedor, topAliados}:
        {totalUsuarios?: any[], totalSuperAdmin?: number, totalOrientador?: number, totalAliado?: number, totalAsesor?: number, totalEmprendedor?: number, topAliados?:{}}
    ) {
        this.totalUsuarios = totalUsuarios ?? [];
        this.totalSuperAdmin = totalSuperAdmin ?? 0;
        this.totalOrientador = totalOrientador ?? 0;
        this.totalAliado = totalAliado ?? 0;
        this.totalAsesor = totalAsesor ?? 0;
        this.totalEmprendedor = totalEmprendedor ?? 0;
        this.topAliados = topAliados;
    }
}

class PromedioAsesoriaData{
    mes: number;
    promedio:number;
    promedioAnual: number

    constructor({mes, promedio, promedioAnual}: {mes?: number, promedio?: number, promedioAnual?: number}){
        this.mes = mes?? 0;
        this.promedio = promedio?? 0;
        this.promedioAnual = promedioAnual?? 0;
    } 
}

class GenerosData{
    generosCounter:number 

    constructor({generosCounter}: {generosCounter?: number}){
        this.generosCounter = generosCounter?? 0;
    }
}

class RegistrosMensualesData{
    emprendedoresCount:number
    aliadosCount: number
    
    constructor({emprendedoresCount, aliadosCount}: {emprendedoresCount?: number, aliadosCount?: number}){
        this.emprendedoresCount = emprendedoresCount?? 0;
        this.aliadosCount = aliadosCount?? 0;
    }
}

class EmprendedorDepartamentoData{
    departamento: string;
    emprendedoresCount: number;
    
    constructor({departamento, emprendedoresCount}: {departamento?: string, emprendedoresCount?: number}){
        this.departamento = departamento?? '';
        this.emprendedoresCount = emprendedoresCount?? 0;
    }
}