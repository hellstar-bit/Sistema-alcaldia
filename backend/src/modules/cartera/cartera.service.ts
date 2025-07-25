// backend/src/modules/cartera/cartera.service.ts - VERSIÓN CORREGIDA
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EPS } from './entities/eps.entity';
import { IPS } from './entities/ips.entity';
import { Periodo } from './entities/periodo.entity';
import { CarteraData } from './entities/cartera-data.entity';
import { CreateCarteraDataDto } from './dto/create-cartera-data.dto';
import { CarteraFilterDto } from './dto/cartera-filter.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class CarteraService {
  constructor(
    @InjectRepository(EPS)
    private epsRepository: Repository<EPS>,
    @InjectRepository(IPS)
    private ipsRepository: Repository<IPS>,
    @InjectRepository(Periodo)
    private periodoRepository: Repository<Periodo>,
    @InjectRepository(CarteraData)
    private carteraDataRepository: Repository<CarteraData>,
  ) {}

  // ===============================================
  // MÉTODOS PARA EPS
  // ===============================================
  async getAllEPS(): Promise<EPS[]> {
    return await this.epsRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' }
    });
  }

  async createEPS(data: Partial<EPS>): Promise<EPS> {
    const eps = this.epsRepository.create(data);
    return await this.epsRepository.save(eps);
  }

  async findOrCreateEPS(nombre: string, codigo?: string): Promise<EPS> {
    let eps = await this.epsRepository.findOne({
      where: { nombre }
    });

    if (!eps) {
      eps = await this.createEPS({
        codigo: codigo || `EPS_${Date.now()}`,
        nombre,
        activa: true
      });
    }

    return eps;
  }

  // ===============================================
  // MÉTODOS PARA IPS
  // ===============================================
  async getAllIPS(): Promise<IPS[]> {
    return await this.ipsRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' }
    });
  }

  async createIPS(data: Partial<IPS>): Promise<IPS> {
    const ips = this.ipsRepository.create(data);
    return await this.ipsRepository.save(ips);
  }

  async findOrCreateIPS(nombre: string, codigo?: string): Promise<IPS> {
    let ips = await this.ipsRepository.findOne({
      where: { nombre }
    });

    if (!ips) {
      ips = await this.createIPS({
        codigo: codigo || `IPS_${Date.now()}`,
        nombre,
        activa: true
      });
    }

    return ips;
  }

  // ===============================================
  // MÉTODOS PARA PERÍODOS
  // ===============================================
  async getAllPeriodos(): Promise<Periodo[]> {
    return await this.periodoRepository.find({
      where: { activo: true },
      order: { year: 'DESC', mes: 'DESC' }
    });
  }

  async createPeriodo(data: Partial<Periodo>): Promise<Periodo> {
    const periodo = this.periodoRepository.create(data);
    return await this.periodoRepository.save(periodo);
  }

  async initializePeriodos(): Promise<void> {
    const existingCount = await this.periodoRepository.count();
    if (existingCount > 0) return;

    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let mes = 1; mes <= 12; mes++) {
        const fechaInicio = new Date(year, mes - 1, 1);
        const fechaFin = new Date(year, mes, 0);

        await this.createPeriodo({
          year,
          mes,
          nombre: meses[mes - 1],
          fechaInicio,
          fechaFin,
          activo: true
        });
      }
    }
  }

  // ===============================================
  // MÉTODOS PARA DATOS DE CARTERA
  // ===============================================
  async getCarteraData(filters: CarteraFilterDto): Promise<{
    data: CarteraData[],
    total: number,
    totalCartera: number
  }> {
    const queryBuilder = this.carteraDataRepository
      .createQueryBuilder('cartera')
      .leftJoinAndSelect('cartera.eps', 'eps')
      .leftJoinAndSelect('cartera.ips', 'ips')
      .leftJoinAndSelect('cartera.periodo', 'periodo')
      .where('cartera.activo = :activo', { activo: true });

    if (filters.epsId) {
      queryBuilder.andWhere('cartera.epsId = :epsId', { epsId: filters.epsId });
    }

    if (filters.periodoId) {
      queryBuilder.andWhere('cartera.periodoId = :periodoId', { periodoId: filters.periodoId });
    }

    if (filters.ipsId) {
      queryBuilder.andWhere('cartera.ipsId = :ipsId', { ipsId: filters.ipsId });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(ips.nombre ILIKE :search OR ips.codigo ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.soloConDatos) {
      queryBuilder.andWhere('cartera.total > 0');
    }

    // Contar total antes de paginación
    const total = await queryBuilder.getCount();

    // Calcular total de cartera
    const totalResult = await queryBuilder
      .select('SUM(cartera.total)', 'totalCartera')
      .getRawOne();
    const totalCartera = parseFloat(totalResult.totalCartera) || 0;

    // Aplicar paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    queryBuilder
      .orderBy('ips.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await queryBuilder.getMany();

    return { data, total, totalCartera };
  }

  async createCarteraData(createDto: CreateCarteraDataDto): Promise<CarteraData> {
    // Verificar que EPS, IPS y Período existan
    const eps = await this.epsRepository.findOne({ where: { id: createDto.epsId } });
    if (!eps) {
      throw new NotFoundException('EPS no encontrada');
    }

    const ips = await this.ipsRepository.findOne({ where: { id: createDto.ipsId } });
    if (!ips) {
      throw new NotFoundException('IPS no encontrada');
    }

    const periodo = await this.periodoRepository.findOne({ where: { id: createDto.periodoId } });
    if (!periodo) {
      throw new NotFoundException('Período no encontrado');
    }

    // Verificar si ya existe un registro para esta combinación
    const existing = await this.carteraDataRepository.findOne({
      where: {
        epsId: createDto.epsId,
        ipsId: createDto.ipsId,
        periodoId: createDto.periodoId
      }
    });

    if (existing) {
      // En lugar de lanzar error, actualizar el registro existente
      existing.a30 = createDto.a30;
      existing.a60 = createDto.a60;
      existing.a90 = createDto.a90;
      existing.a120 = createDto.a120;
      existing.a180 = createDto.a180;
      existing.a360 = createDto.a360;
      existing.sup360 = createDto.sup360;
      existing.observaciones = createDto.observaciones || existing.observaciones;
      existing.calcularTotal();
      
      return await this.carteraDataRepository.save(existing);
    }

    const carteraData = this.carteraDataRepository.create(createDto);
    carteraData.calcularTotal();
    
    return await this.carteraDataRepository.save(carteraData);
  }

  async getEPSPeriodoStatus(): Promise<Array<{
    epsId: string,
    periodoId: string,
    tieneData: boolean,
    totalRegistros: number,
    totalCartera: number
  }>> {
    const result = await this.carteraDataRepository
      .createQueryBuilder('cartera')
      .select([
        'cartera.epsId',
        'cartera.periodoId',
        'COUNT(cartera.id) as totalRegistros',
        'SUM(cartera.total) as totalCartera'
      ])
      .where('cartera.activo = :activo', { activo: true })
      .groupBy('cartera.epsId, cartera.periodoId')
      .getRawMany();

    return result.map(item => ({
      epsId: item.cartera_epsId,
      periodoId: item.cartera_periodoId,
      tieneData: parseInt(item.totalRegistros) > 0,
      totalRegistros: parseInt(item.totalRegistros),
      totalCartera: parseFloat(item.totalCartera) || 0
    }));
  }

  // ===============================================
  // MÉTODOS PARA EXCEL
  // ===============================================
  async generatePlantillaExcel(): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  
  // Crear hoja con plantilla simplificada
  const plantillaData = [
    ['IPS', 'A30', 'A60', 'A90', 'A120', 'A180', 'A360', 'SUP360', 'TOTAL'],
    ['Ejemplo IPS 1', '1000000', '500000', '300000', '200000', '100000', '50000', '25000', '2175000'],
    ['Ejemplo IPS 2', '800000', '600000', '400000', '300000', '200000', '100000', '50000', '2450000'],
    ['Ejemplo IPS 3', '0', '0', '1500000', '1000000', '500000', '250000', '100000', '3350000'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(plantillaData);
  
  // Configurar anchos de columna
  worksheet['!cols'] = [
    { wch: 40 }, // IPS
    { wch: 15 }, // A30
    { wch: 15 }, // A60
    { wch: 15 }, // A90
    { wch: 15 }, // A120
    { wch: 15 }, // A180
    { wch: 15 }, // A360
    { wch: 15 }, // SUP360
    { wch: 18 }, // TOTAL
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Cartera');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

  async processExcelUpload(
  buffer: Buffer, 
  epsId: string, 
  periodoId: string
): Promise<{
  success: boolean,
  message: string,
  processed: number,
  errors: string[]
}> {
  try {
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const errors: string[] = [];
    let processed = 0;

    // Saltar la primera fila (headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      if (!row || row.length === 0) continue;

      try {
        // Nuevos campos simplificados: IPS, A30, A60, A90, A120, A180, A360, SUP360, TOTAL
        const [nombreIPS, a30, a60, a90, a120, a180, a360, sup360, total] = row;

        if (!nombreIPS) {
          errors.push(`Fila ${i + 1}: Nombre de IPS es requerido`);
          continue;
        }

        // Buscar o crear IPS (sin código, solo por nombre)
        const ips = await this.findOrCreateIPS(nombreIPS, `IPS_${Date.now()}_${i}`);

        // Convertir valores a números
        const valoresCartera = {
          a30: parseFloat(a30) || 0,
          a60: parseFloat(a60) || 0,
          a90: parseFloat(a90) || 0,
          a120: parseFloat(a120) || 0,
          a180: parseFloat(a180) || 0,
          a360: parseFloat(a360) || 0,
          sup360: parseFloat(sup360) || 0,
        };

        // Calcular total automáticamente (ignorar el total del Excel)
        const totalCalculado = Object.values(valoresCartera).reduce((sum, val) => sum + val, 0);

        // Validar que al menos un valor sea mayor a 0
        if (totalCalculado === 0) {
          errors.push(`Fila ${i + 1}: "${nombreIPS}" - Todos los valores de cartera son 0`);
          continue;
        }

        // Crear registro de cartera
        const carteraData = {
          epsId,
          ipsId: ips.id,
          periodoId,
          ...valoresCartera,
          observaciones: undefined
        };

        await this.createCarteraData(carteraData);
        processed++;

      } catch (error) {
        errors.push(`Fila ${i + 1}: ${error.message}`);
      }
    }

    return {
      success: processed > 0,
      message: `Procesados ${processed} registros${errors.length > 0 ? ` con ${errors.length} advertencias` : ''}`,
      processed,
      errors
    };

  } catch (error) {
    return {
      success: false,
      message: `Error al procesar archivo: ${error.message}`,
      processed: 0,
      errors: [error.message]
    };
  }
}

  async exportCarteraToExcel(filters: CarteraFilterDto): Promise<Buffer> {
    const { data } = await this.getCarteraData({ ...filters, page: 1, limit: 10000 });
    
    const excelData = data.map(item => ({
      'EPS': item.eps.nombre,
      'IPS_CODIGO': item.ips.codigo,
      'IPS_NOMBRE': item.ips.nombre,
      'PERIODO': `${item.periodo.nombre} ${item.periodo.year}`,
      'A30': item.a30,
      'A60': item.a60,
      'A90': item.a90,
      'A120': item.a120,
      'A180': item.a180,
      'A360': item.a360,
      'SUP360': item.sup360,
      'TOTAL': item.total,
      'OBSERVACIONES': item.observaciones || '',
      'FECHA_CREACION': item.createdAt.toLocaleDateString('es-CO')
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 20 }, // EPS
      { wch: 15 }, // IPS_CODIGO
      { wch: 40 }, // IPS_NOMBRE
      { wch: 20 }, // PERIODO
      { wch: 15 }, // A30
      { wch: 15 }, // A60
      { wch: 15 }, // A90
      { wch: 15 }, // A120
      { wch: 15 }, // A180
      { wch: 15 }, // A360
      { wch: 15 }, // SUP360
      { wch: 18 }, // TOTAL
      { wch: 25 }, // OBSERVACIONES
      { wch: 15 }, // FECHA_CREACION
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cartera Export');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}