// backend/src/modules/adres/adres.service.ts - VERSIÓN COMPLETA
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdresData } from './entities/adres-data.entity';
import { EPS } from '../cartera/entities/eps.entity';
import { Periodo } from '../cartera/entities/periodo.entity';
import { CreateAdresDataDto } from './dto/create-adres-data.dto';
import { AdresFilterDto } from './dto/adres-filter.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AdresService {
  constructor(
    @InjectRepository(AdresData)
    private adresDataRepository: Repository<AdresData>,
    @InjectRepository(EPS)
    private epsRepository: Repository<EPS>,
    @InjectRepository(Periodo)
    private periodoRepository: Repository<Periodo>,
  ) {}

  // ✅ Método para obtener todas las EPS
  async getAllEPS(): Promise<EPS[]> {
    console.log('🏢 AdresService: getAllEPS - Fetching all EPS...');

    try {
      const eps = await this.epsRepository.find({
        where: { activa: true },
        order: { nombre: 'ASC' }
      });

      console.log(`✅ AdresService: Found ${eps.length} active EPS`);
      return eps;
    } catch (error) {
      console.error('❌ AdresService: Error fetching EPS:', error);
      throw new BadRequestException(`Error al obtener EPS: ${error.message}`);
    }
  }

  // ✅ Método para obtener todos los períodos
  async getAllPeriodos(): Promise<Periodo[]> {
    console.log('📅 AdresService: getAllPeriodos - Fetching all periods...');

    try {
      const periodos = await this.periodoRepository.find({
        where: { activo: true },
        order: { year: 'DESC', mes: 'DESC' }
      });

      console.log(`✅ AdresService: Found ${periodos.length} active periods`);
      return periodos;
    } catch (error) {
      console.error('❌ AdresService: Error fetching periods:', error);
      throw new BadRequestException(`Error al obtener períodos: ${error.message}`);
    }
  }

  // ✅ Método para status EPS-Período
  
async getEPSPeriodoStatus(): Promise<Array<{
  epsId: string,
  periodoId: string,
  tieneData: boolean,
  totalRegistros: number,
  totalValorGirado: number
}>> {
  console.log('📊 AdresService: getEPSPeriodoStatus - Calculating status...');

  try {
    const result = await this.adresDataRepository
      .createQueryBuilder('adres')
      .select([
        'adres.epsId as epsId',
        'adres.periodoId as periodoId', 
        'COUNT(adres.id) as totalRegistros',
        'SUM(adres.valorGirado) as totalValorGirado'
      ])
      .where('adres.activo = :activo', { activo: true })
      .groupBy('adres.epsId, adres.periodoId')
      .getRawMany();

    console.log('📊 AdresService: Raw query result:', result);

    // ✅ CORRECCIÓN: PostgreSQL devuelve nombres en lowercase
    const statusArray = result.map(item => {
      // 🔧 Acceder a los campos en lowercase (como los devuelve PostgreSQL)
      const epsId = item.epsid || item.epsId;                    // ✅ lowercase primero
      const periodoId = item.periodoid || item.periodoId;        // ✅ lowercase primero
      const totalRegistros = item.totalregistros || item.totalRegistros; // ✅ lowercase primero
      const totalValorGirado = item.totalvalorgirado || item.totalValorGirado; // ✅ lowercase primero

      console.log('🔍 AdresService: Processing item CORREGIDO:', {
        originalItem: item,
        originalKeys: Object.keys(item),
        extractedValues: {
          epsId,
          periodoId,
          totalRegistros,
          totalValorGirado
        }
      });
      
      return {
        epsId: epsId,
        periodoId: periodoId,
        tieneData: parseInt(totalRegistros) > 0,
        totalRegistros: parseInt(totalRegistros) || 0,
        totalValorGirado: parseFloat(totalValorGirado) || 0
      };
    });

    console.log('📊 AdresService: Processed status array CORREGIDO:', statusArray);
    console.log(`✅ AdresService: Found ${statusArray.length} EPS-Periodo combinations with data`);

    return statusArray;

  } catch (error) {
    console.error('❌ AdresService: Error calculating EPS periodo status:', error);
    throw new BadRequestException(`Error al obtener estado de períodos: ${error.message}`);
  }
}

  // ✅ Método para obtener datos de ADRES
  async getAdresData(filters: AdresFilterDto): Promise<{ data: AdresData[], total: number, totalValorGirado: number }> {
  console.log('💰 AdresService: getAdresData - Fetching ADRES data...', filters);

  try {
    // ✅ STEP 1: Query base para filtros
    const baseQuery = this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoinAndSelect('adres.eps', 'eps')
      .leftJoinAndSelect('adres.periodo', 'periodo')
      .where('adres.activo = :activo', { activo: true });

    if (filters.epsId) {
      console.log('🔍 AdresService: Adding EPS filter:', filters.epsId);
      baseQuery.andWhere('adres.epsId = :epsId', { epsId: filters.epsId });
    }

    if (filters.periodoId) {
      console.log('🔍 AdresService: Adding Periodo filter:', filters.periodoId);
      baseQuery.andWhere('adres.periodoId = :periodoId', { periodoId: filters.periodoId });
    }

    if (filters.search) {
      baseQuery.andWhere(
        '(eps.nombre LIKE :search OR eps.codigo LIKE :search OR adres.observaciones LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // ✅ STEP 2: Obtener total (count)
    const total = await baseQuery.getCount();
    console.log('📊 AdresService: Total records found:', total);

    if (total === 0) {
      console.log('ℹ️ AdresService: No records found, returning empty result');
      return { data: [], total: 0, totalValorGirado: 0 };
    }

    // ✅ STEP 3: Calcular totalValorGirado con query separado (SIN paginación)
    const totalQuery = this.adresDataRepository
      .createQueryBuilder('adres')
      .select('SUM(adres.valorGirado)', 'total')
      .where('adres.activo = :activo', { activo: true });

    if (filters.epsId) {
      totalQuery.andWhere('adres.epsId = :epsId', { epsId: filters.epsId });
    }

    if (filters.periodoId) {
      totalQuery.andWhere('adres.periodoId = :periodoId', { periodoId: filters.periodoId });
    }

    if (filters.search) {
      totalQuery
        .leftJoin('adres.eps', 'eps_for_search')
        .andWhere(
          '(eps_for_search.nombre LIKE :search OR eps_for_search.codigo LIKE :search OR adres.observaciones LIKE :search)',
          { search: `%${filters.search}%` }
        );
    }

    const totalResult = await totalQuery.getRawOne();
    const totalValorGirado = parseFloat(totalResult?.total) || 0;
    console.log('💰 AdresService: Total valor girado:', totalValorGirado);

    // ✅ STEP 4: Obtener datos con paginación (query separado)
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    console.log('📄 AdresService: Applying pagination:', { page, limit });

    const dataQuery = this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoinAndSelect('adres.eps', 'eps')
      .leftJoinAndSelect('adres.periodo', 'periodo')
      .where('adres.activo = :activo', { activo: true });

    if (filters.epsId) {
      dataQuery.andWhere('adres.epsId = :epsId', { epsId: filters.epsId });
    }

    if (filters.periodoId) {
      dataQuery.andWhere('adres.periodoId = :periodoId', { periodoId: filters.periodoId });
    }

    if (filters.search) {
      dataQuery.andWhere(
        '(eps.nombre LIKE :search OR eps.codigo LIKE :search OR adres.observaciones LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // ✅ Aplicar ordenamiento y paginación
    dataQuery
      .orderBy('adres.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await dataQuery.getMany();
    console.log(`✅ AdresService: Query executed successfully, found ${data.length} records`);
    
    // ✅ Log de sample record si existe
    if (data.length > 0) {
      const sample = data[0];
      console.log('🔍 AdresService: Sample record:', {
        id: sample.id,
        epsId: sample.epsId,
        epsNombre: sample.eps?.nombre,
        periodoId: sample.periodoId,
        periodoNombre: sample.periodo?.nombre,
        upc: sample.upc,
        valorGirado: sample.valorGirado,
        createdAt: sample.createdAt
      });
    }

    return { data, total, totalValorGirado };

  } catch (error) {
    console.error('❌ AdresService: Error in getAdresData:', error);
    console.error('❌ AdresService: Error stack:', error.stack);
    
    throw new BadRequestException(`Error al obtener datos de ADRES: ${error.message}`);
  }
}

  // ✅ Método para crear datos de ADRES
  async createAdresData(createDto: CreateAdresDataDto): Promise<AdresData> {
    console.log('➕ AdresService: createAdresData - Creating ADRES data...', createDto);

    try {
      const eps = await this.epsRepository.findOne({ where: { id: createDto.epsId } });
      if (!eps) {
        throw new BadRequestException('EPS no encontrada');
      }

      const periodo = await this.periodoRepository.findOne({ where: { id: createDto.periodoId } });
      if (!periodo) {
        throw new BadRequestException('Período no encontrado');
      }

      const adresData = this.adresDataRepository.create({
        eps,
        periodo,
        upc: createDto.upc,
        valorGirado: createDto.valorGirado,
        observaciones: createDto.observaciones,
        activo: true
      });

      const saved = await this.adresDataRepository.save(adresData);
      console.log('✅ AdresService: ADRES data created successfully:', saved.id);
      return saved;
    } catch (error) {
      console.error('❌ AdresService: Error creating ADRES data:', error);
      throw new BadRequestException(`Error al crear datos de ADRES: ${error.message}`);
    }
  }

  // ✅ Método para obtener estadísticas
  async getAdresStats(filters: AdresFilterDto): Promise<any> {
    console.log('📊 AdresService: getAdresStats - Calculating statistics...', filters);

    try {
      const queryBuilder = this.adresDataRepository
        .createQueryBuilder('adres')
        .leftJoin('adres.eps', 'eps')
        .where('adres.activo = :activo', { activo: true });

      if (filters.epsId) {
        queryBuilder.andWhere('adres.epsId = :epsId', { epsId: filters.epsId });
      }

      if (filters.periodoId) {
        queryBuilder.andWhere('adres.periodoId = :periodoId', { periodoId: filters.periodoId });
      }

      const totalRegistros = await queryBuilder.getCount();
      
      const totalUPCResult = await queryBuilder
        .select('SUM(adres.upc)', 'total')
        .getRawOne();
      const totalUPC = parseFloat(totalUPCResult?.total) || 0;

      const totalValorGiradoResult = await queryBuilder
        .select('SUM(adres.valorGirado)', 'total')
        .getRawOne();
      const totalValorGirado = parseFloat(totalValorGiradoResult?.total) || 0;

      const porEPSResult = await queryBuilder
        .select([
          'eps.nombre as epsNombre',
          'COUNT(adres.id) as count',
          'SUM(adres.valorGirado) as sumValorGirado'
        ])
        .groupBy('eps.id, eps.nombre')
        .getRawMany();

      const porEPS = porEPSResult.map(item => ({
        epsNombre: item.epsNombre,
        count: parseInt(item.count),
        sumValorGirado: parseFloat(item.sumValorGirado) || 0
      }));

      const stats = {
        totalRegistros,
        totalUPC,
        totalValorGirado,
        porEPS
      };

      console.log('✅ AdresService: Statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ AdresService: Error calculating statistics:', error);
      throw new BadRequestException(`Error al calcular estadísticas: ${error.message}`);
    }
  }

  // ✅ Método para eliminar datos por período
  async deleteAdresDataByPeriodo(epsId: string, periodoId: string): Promise<{ deletedCount: number }> {
    console.log('🗑️ AdresService: deleteAdresDataByPeriodo - Deleting data...', { epsId, periodoId });

    try {
      const result = await this.adresDataRepository.delete({
        eps: { id: epsId },
        periodo: { id: periodoId }
      });

      console.log(`✅ AdresService: Deleted ${result.affected} records`);
      return { deletedCount: result.affected || 0 };
    } catch (error) {
      console.error('❌ AdresService: Error deleting data:', error);
      throw new BadRequestException(`Error al eliminar datos: ${error.message}`);
    }
  }

  // ✅ Método para generar plantilla Excel
  async generatePlantillaExcel(): Promise<Buffer> {
  console.log('📄 AdresService: generatePlantillaExcel - Generating template...');

  try {
    const workbook = XLSX.utils.book_new();
    
    // ✅ Headers exactos que espera el procesador
    const headers = ['EPS', 'UPC', 'Valor Girado', 'Observaciones'];
    
    // ✅ Datos de ejemplo más diversos para testing
    const sampleData = [
      ['COMPENSAR', 50000, 1000000, 'Ejemplo de observaciones'],
      ['COOSALUD', 45000, 850000, 'Segunda fila de ejemplo'],
      ['FAMISANAR', 52000, 950000, 'Tercera fila de ejemplo']
    ];

    console.log('📄 Template data:', {
      headers,
      sampleRowCount: sampleData.length
    });

    const worksheetData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // ✅ Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 15 }, // EPS
      { wch: 15 }, // UPC
      { wch: 20 }, // Valor Girado
      { wch: 30 }  // Observaciones
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla ADRES');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log('✅ AdresService: Excel template generated successfully');
    return buffer;
  } catch (error) {
    console.error('❌ AdresService: Error generating Excel template:', error);
    throw new BadRequestException(`Error al generar plantilla: ${error.message}`);
  }
}

  // ✅ Método para procesar archivo subido
  async processFileUpload(buffer: Buffer, epsId: string, periodoId: string, selectedFields: string[]): Promise<{ success: boolean, message: string, processed: number, errors: string[] }> {
  console.log('📤 AdresService: processFileUpload - Processing uploaded file...');
  console.log('📤 File details:', {
    bufferSize: buffer.length,
    epsId,
    periodoId,
    selectedFields
  });

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('📤 Workbook sheets:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    });
    
    console.log('📤 Raw data from Excel:', {
      totalRows: jsonData.length,
      firstFewRows: jsonData.slice(0, 5)
    });

    if (jsonData.length < 2) {
      throw new BadRequestException('El archivo debe contener al menos una fila de datos además del encabezado');
    }

    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);
    
    console.log('📤 Headers found:', headers);
    console.log('📤 Data rows to process:', dataRows.length);

    // Header mapping
    const headerMap = {
      eps: -1,
      upc: -1,
      valorGirado: -1,
      observaciones: -1
    };

    headers.forEach((header, index) => {
      const normalizedHeader = header.toString().trim().toLowerCase();
      if (normalizedHeader === 'eps') {
        headerMap.eps = index;
      } else if (normalizedHeader === 'upc') {
        headerMap.upc = index;
      } else if (normalizedHeader === 'valor girado' || normalizedHeader === 'valorgirado') {
        headerMap.valorGirado = index;
      } else if (normalizedHeader === 'observaciones') {
        headerMap.observaciones = index;
      }
    });

    console.log('📤 Header mapping:', headerMap);

    if (headerMap.upc === -1 || headerMap.valorGirado === -1) {
      throw new BadRequestException('El archivo debe contener al menos las columnas "UPC" y "Valor Girado"');
    }

    const eps = await this.epsRepository.findOne({ where: { id: epsId } });
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });

    if (!eps || !periodo) {
      throw new BadRequestException('EPS o Período no encontrado');
    }

    console.log('📤 Target EPS:', { id: eps.id, nombre: eps.nombre });
    console.log('📤 Target Período:', { id: periodo.id, nombre: periodo.nombre });

    // ✅ NUEVO: Eliminar registros existentes para esta EPS/Período antes de insertar
    console.log('🗑️ Eliminando registros existentes para evitar duplicados...');
    const deleteResult = await this.adresDataRepository.delete({
      eps: { id: epsId },
      periodo: { id: periodoId }
    });
    console.log('🗑️ Registros eliminados:', deleteResult.affected);

    let processed = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowIndex = i + 2;
      const row = dataRows[i] as any[];
      
      console.log(`📤 Processing row ${rowIndex}:`, row);

      try {
        const upcValue = row[headerMap.upc];
        const valorGiradoValue = row[headerMap.valorGirado];
        const observacionesValue = headerMap.observaciones !== -1 ? row[headerMap.observaciones] : '';

        console.log(`📤 Row ${rowIndex} extracted values:`, {
          upc: upcValue,
          valorGirado: valorGiradoValue,
          observaciones: observacionesValue
        });

        if (!upcValue && upcValue !== 0) {
          errors.push(`Fila ${rowIndex}: UPC está vacío`);
          continue;
        }

        if (!valorGiradoValue && valorGiradoValue !== 0) {
          errors.push(`Fila ${rowIndex}: Valor Girado está vacío`);
          continue;
        }

        const upc = parseFloat(upcValue.toString().replace(/[,$]/g, ''));
        const valorGirado = parseFloat(valorGiradoValue.toString().replace(/[,$]/g, ''));

        if (isNaN(upc)) {
          errors.push(`Fila ${rowIndex}: UPC no es un número válido (${upcValue})`);
          continue;
        }

        if (isNaN(valorGirado)) {
          errors.push(`Fila ${rowIndex}: Valor Girado no es un número válido (${valorGiradoValue})`);
          continue;
        }

        console.log(`📤 Row ${rowIndex} converted values:`, {
          upc,
          valorGirado,
          observaciones: observacionesValue
        });

        // ✅ CAMBIO: Ahora podemos insertar sin problema de duplicados
        const adresData = this.adresDataRepository.create({
          eps,
          periodo,
          upc,
          valorGirado,
          observaciones: observacionesValue?.toString() || '',
          activo: true
        });

        const saved = await this.adresDataRepository.save(adresData);
        console.log(`✅ Row ${rowIndex} saved successfully with ID:`, saved.id);
        
        processed++;

      } catch (error) {
        console.error(`❌ Error processing row ${rowIndex}:`, error);
        errors.push(`Fila ${rowIndex}: ${error.message}`);
      }
    }

    console.log(`✅ AdresService: File processed - ${processed} records processed, ${errors.length} errors`);
    
    if (errors.length > 0) {
      console.log('📤 Processing errors:', errors);
    }

    return {
      success: true,
      message: `Se procesaron ${processed} registros exitosamente${errors.length > 0 ? ` con ${errors.length} errores` : ''}`,
      processed,
      errors
    };

  } catch (error) {
    console.error('❌ AdresService: Error processing file:', error);
    throw new BadRequestException(`Error al procesar archivo: ${error.message}`);
  }
}

  // ✅ Método para exportar a Excel
  async exportAdresToExcel(filters: AdresFilterDto): Promise<Buffer> {
    console.log('📋 AdresService: exportAdresToExcel - Exporting to Excel...', filters);

    try {
      const { data } = await this.getAdresData({ ...filters, page: 1, limit: 10000 });

      const exportData = data.map(item => ({
        'EPS': item.eps.nombre,
        'Código EPS': item.eps.codigo,
        'Período': `${item.periodo.nombre} ${item.periodo.year}`,
        'UPC': item.upc,
        'Valor Girado': item.valorGirado,
        'Observaciones': item.observaciones || '',
        'Fecha Creación': item.createdAt
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos ADRES');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      console.log(`✅ AdresService: Excel export generated with ${exportData.length} records`);
      return buffer;
    } catch (error) {
      console.error('❌ AdresService: Error exporting to Excel:', error);
      throw new BadRequestException(`Error al exportar: ${error.message}`);
    }
  }

// ✅ Método para eliminar un registro específico
async deleteAdresData(id: string): Promise<void> {
  console.log('🗑️ AdresService: deleteAdresData - Deleting specific record...', { id });

  try {
    const adresData = await this.adresDataRepository.findOne({ 
      where: { id },
      relations: ['eps', 'periodo']
    });

    if (!adresData) {
      throw new BadRequestException('Registro de ADRES no encontrado');
    }

    await this.adresDataRepository.remove(adresData);
    console.log('✅ AdresService: ADRES data deleted successfully:', id);
  } catch (error) {
    console.error('❌ AdresService: Error deleting ADRES data:', error);
    throw new BadRequestException(`Error al eliminar registro: ${error.message}`);
  }
}

// ✅ Método para actualizar datos de ADRES
async updateAdresData(id: string, updateDto: CreateAdresDataDto): Promise<AdresData> {
  console.log('📝 AdresService: updateAdresData - Updating ADRES data...', { id, updateDto });

  try {
    const adresData = await this.adresDataRepository.findOne({ 
      where: { id },
      relations: ['eps', 'periodo']
    });

    if (!adresData) {
      throw new BadRequestException('Registro de ADRES no encontrado');
    }

    // Verificar EPS si se cambió
    if (updateDto.epsId && updateDto.epsId !== adresData.eps.id) {
      const eps = await this.epsRepository.findOne({ where: { id: updateDto.epsId } });
      if (!eps) {
        throw new BadRequestException('EPS no encontrada');
      }
      adresData.eps = eps;
    }

    // Verificar período si se cambió
    if (updateDto.periodoId && updateDto.periodoId !== adresData.periodo.id) {
      const periodo = await this.periodoRepository.findOne({ where: { id: updateDto.periodoId } });
      if (!periodo) {
        throw new BadRequestException('Período no encontrado');
      }
      adresData.periodo = periodo;
    }

    // Actualizar campos
    if (updateDto.upc !== undefined) adresData.upc = updateDto.upc;
    if (updateDto.valorGirado !== undefined) adresData.valorGirado = updateDto.valorGirado;
    if (updateDto.observaciones !== undefined) adresData.observaciones = updateDto.observaciones;

    const saved = await this.adresDataRepository.save(adresData);
    console.log('✅ AdresService: ADRES data updated successfully:', saved.id);
    return saved;
  } catch (error) {
    console.error('❌ AdresService: Error updating ADRES data:', error);
    throw new BadRequestException(`Error al actualizar datos: ${error.message}`);
  }
}

// ✅ Método para validar archivo Excel antes de procesar
async validateExcel(file: Express.Multer.File, epsId: string, periodoId: string): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview: any[];
}> {
  console.log('🔍 AdresService: validateExcel - Validating Excel file...', {
    fileName: file.originalname,
    fileSize: file.size,
    epsId,
    periodoId
  });

  try {
    // Verificar que la EPS existe
    const eps = await this.epsRepository.findOne({ where: { id: epsId } });
    if (!eps) {
      throw new BadRequestException('EPS no encontrada');
    }

    // Verificar que el período existe
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new BadRequestException('Período no encontrado');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const errors: string[] = [];
    const warnings: string[] = [];
    const preview: any[] = [];

    // Validar estructura básica
    if (jsonData.length === 0) {
      errors.push('El archivo está vacío');
      return { isValid: false, errors, warnings, preview };
    }

    // Validar headers esperados
    const expectedHeaders = ['UPC', 'Valor Girado', 'Observaciones'];
    const firstRow = jsonData[0] as any;
    const actualHeaders = Object.keys(firstRow);
    
    const missingHeaders = expectedHeaders.filter(header => 
      !actualHeaders.some(actual => actual.toLowerCase().includes(header.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      errors.push(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
    }

    // Validar datos
    jsonData.forEach((row: any, index: number) => {
      const rowNum = index + 2; // +2 porque Excel empieza en 1 y tiene header
      
      // Validar UPC
      if (!row.UPC || isNaN(Number(row.UPC))) {
        errors.push(`Fila ${rowNum}: UPC debe ser un número válido`);
      }

      // Validar Valor Girado
      if (!row['Valor Girado'] || isNaN(Number(row['Valor Girado']))) {
        errors.push(`Fila ${rowNum}: Valor Girado debe ser un número válido`);
      }

      // Preview de las primeras 5 filas válidas
      if (preview.length < 5 && row.UPC && row['Valor Girado']) {
        preview.push({
          fila: rowNum,
          upc: Number(row.UPC),
          valorGirado: Number(row['Valor Girado']),
          observaciones: row.Observaciones || ''
        });
      }
    });

    // Warnings
    if (jsonData.length > 1000) {
      warnings.push(`El archivo contiene ${jsonData.length} filas. Archivos grandes pueden tardar más en procesarse.`);
    }

    const isValid = errors.length === 0;
    console.log(`✅ AdresService: Validation completed. Valid: ${isValid}, Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return { isValid, errors, warnings, preview };
  } catch (error) {
    console.error('❌ AdresService: Error validating Excel:', error);
    throw new BadRequestException(`Error al validar archivo: ${error.message}`);
  }
}

// ✅ Método para obtener resumen por EPS
async getAdresSummaryByEPS(epsId: string): Promise<{
  eps: EPS;
  totalRegistros: number;
  totalUPC: number;
  totalValorGirado: number;
  porPeriodo: Array<{
    periodo: Periodo;
    registros: number;
    upcTotal: number;
    valorGiradoTotal: number;
  }>;
}> {
  console.log('📈 AdresService: getAdresSummaryByEPS - Getting summary for EPS...', { epsId });

  try {
    // Verificar que la EPS existe
    const eps = await this.epsRepository.findOne({ where: { id: epsId } });
    if (!eps) {
      throw new BadRequestException('EPS no encontrada');
    }

    // Obtener datos por período
    const dataByPeriod = await this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoinAndSelect('adres.periodo', 'periodo')
      .select([
        'periodo.id as periodoId',
        'periodo.nombre as periodoNombre',
        'periodo.year as periodoYear',
        'periodo.mes as periodoMes',
        'COUNT(adres.id) as registros',
        'SUM(adres.upc) as upcTotal',
        'SUM(adres.valorGirado) as valorGiradoTotal'
      ])
      .where('adres.epsId = :epsId', { epsId })
      .andWhere('adres.activo = :activo', { activo: true })
      .groupBy('periodo.id, periodo.nombre, periodo.year, periodo.mes')
      .orderBy('periodo.year', 'DESC')
      .addOrderBy('periodo.mes', 'DESC')
      .getRawMany();

    // Obtener totales generales
    const totals = await this.adresDataRepository
      .createQueryBuilder('adres')
      .select([
        'COUNT(adres.id) as totalRegistros',
        'SUM(adres.upc) as totalUPC',
        'SUM(adres.valorGirado) as totalValorGirado'
      ])
      .where('adres.epsId = :epsId', { epsId })
      .andWhere('adres.activo = :activo', { activo: true })
      .getRawOne();

    // ✅ CORRECCIÓN: Formatear resultado filtrando períodos válidos
    const porPeriodo = await Promise.all(
      dataByPeriod.map(async (item) => {
        const periodo = await this.periodoRepository.findOne({ where: { id: item.periodoId } });
        return {
          periodo,
          registros: parseInt(item.registros) || 0,
          upcTotal: parseFloat(item.upcTotal) || 0,
          valorGiradoTotal: parseFloat(item.valorGiradoTotal) || 0
        };
      })
    );

    // ✅ FILTRAR períodos que existen (no null)
    const porPeriodoValidos = porPeriodo.filter(item => item.periodo !== null) as Array<{
      periodo: Periodo;
      registros: number;
      upcTotal: number;
      valorGiradoTotal: number;
    }>;

    const result = {
      eps,
      totalRegistros: parseInt(totals.totalRegistros) || 0,
      totalUPC: parseFloat(totals.totalUPC) || 0,
      totalValorGirado: parseFloat(totals.totalValorGirado) || 0,
      porPeriodo: porPeriodoValidos  // ✅ Solo períodos válidos
    };

    console.log('✅ AdresService: Summary generated successfully');
    return result;
  } catch (error) {
    console.error('❌ AdresService: Error getting summary:', error);
    throw new BadRequestException(`Error al obtener resumen: ${error.message}`);
  }
}

async uploadExcel(file: Express.Multer.File, epsId: string, periodoId: string): Promise<{
  processed: number;
  errors: string[];
}> {
  console.log('📤 AdresService: uploadExcel - Processing file...', {
    fileName: file.originalname,
    fileSize: file.size,
    epsId,
    periodoId
  });

  try {
    // Verificar que la EPS existe
    const eps = await this.epsRepository.findOne({ where: { id: epsId } });
    if (!eps) {
      throw new BadRequestException('EPS no encontrada');
    }

    // Verificar que el período existe
    const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
    if (!periodo) {
      throw new BadRequestException('Período no encontrado');
    }

    // Leer archivo Excel
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📋 AdresService: Processing ${jsonData.length} rows from Excel`);

    const errors: string[] = [];
    let processed = 0;

    // Procesar cada fila
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y tiene header

      try {
        // Validar campos requeridos
        if (!row.UPC || isNaN(Number(row.UPC))) {
          errors.push(`Fila ${rowNumber}: UPC debe ser un número válido`);
          continue;
        }

        if (!row['Valor Girado'] || isNaN(Number(row['Valor Girado']))) {
          errors.push(`Fila ${rowNumber}: Valor Girado debe ser un número válido`);
          continue;
        }

        // Crear registro de ADRES
        const adresData = this.adresDataRepository.create({
          eps,
          periodo,
          epsId: eps.id,
          periodoId: periodo.id,
          upc: Number(row.UPC),
          valorGirado: Number(row['Valor Girado']),
          observaciones: row.Observaciones || null,
          activo: true
        });

        await this.adresDataRepository.save(adresData);
        processed++;

        console.log(`✅ AdresService: Processed row ${rowNumber} successfully`);

      } catch (error) {
        console.error(`❌ AdresService: Error processing row ${rowNumber}:`, error);
        errors.push(`Fila ${rowNumber}: ${error.message}`);
      }
    }

    console.log(`✅ AdresService: Upload completed - ${processed} registros procesados${
      errors.length > 0 ? ` con ${errors.length} errores` : ''
    }`);

    return {
      processed,
      errors
    };

  } catch (error) {
    console.error('❌ AdresService: Error processing file:', error);
    throw new BadRequestException(`Error al procesar archivo: ${error.message}`);
  }
}

// ✅ Método para obtener tendencias
async getAdresTrends(filters: AdresFilterDto): Promise<{
  tendenciaUPC: Array<{ periodo: string, valor: number }>;
  tendenciaValorGirado: Array<{ periodo: string, valor: number }>;
  comparativoEPS: Array<{ eps: string, upc: number, valorGirado: number }>;
}> {
  console.log('📊 AdresService: getAdresTrends - Getting trends...', filters);

  try {
    const baseQuery = this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoin('adres.eps', 'eps')
      .leftJoin('adres.periodo', 'periodo')
      .where('adres.activo = :activo', { activo: true });

    if (filters.epsId) {
      baseQuery.andWhere('adres.epsId = :epsId', { epsId: filters.epsId });
    }

    // Tendencias por período
    const tendenciaData = await baseQuery
      .select([
        'periodo.nombre as periodoNombre',
        'periodo.year as periodoYear',
        'periodo.mes as periodoMes',
        'AVG(adres.upc) as promedioUPC',
        'SUM(adres.valorGirado) as totalValorGirado'
      ])
      .groupBy('periodo.id, periodo.nombre, periodo.year, periodo.mes')
      .orderBy('periodo.year', 'ASC')
      .addOrderBy('periodo.mes', 'ASC')
      .getRawMany();

    // Comparativo por EPS
    const comparativoData = await this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoin('adres.eps', 'eps')
      .select([
        'eps.nombre as epsNombre',
        'AVG(adres.upc) as promedioUPC',
        'SUM(adres.valorGirado) as totalValorGirado'
      ])
      .where('adres.activo = :activo', { activo: true })
      .groupBy('eps.id, eps.nombre')
      .orderBy('totalValorGirado', 'DESC')
      .getRawMany();

    const result = {
      tendenciaUPC: tendenciaData.map(item => ({
        periodo: `${item.periodoNombre} ${item.periodoYear}`,
        valor: parseFloat(item.promedioUPC) || 0
      })),
      tendenciaValorGirado: tendenciaData.map(item => ({
        periodo: `${item.periodoNombre} ${item.periodoYear}`,
        valor: parseFloat(item.totalValorGirado) || 0
      })),
      comparativoEPS: comparativoData.map(item => ({
        eps: item.epsNombre,
        upc: parseFloat(item.promedioUPC) || 0,
        valorGirado: parseFloat(item.totalValorGirado) || 0
      }))
    };

    console.log('✅ AdresService: Trends generated successfully');
    return result;
  } catch (error) {
    console.error('❌ AdresService: Error getting trends:', error);
    throw new BadRequestException(`Error al obtener tendencias: ${error.message}`);
  }
}

// ✅ Método para health check
async getHealthStatus(): Promise<{
  database: string;
  recordsCount: number;
  lastUpdate: Date | null;
  activeEPS: number;
  activePeriods: number;
}> {
  console.log('🏥 AdresService: getHealthStatus - Checking health...');

  try {
    // Verificar conexión a la base de datos
    const recordsCount = await this.adresDataRepository.count();
    
    // Obtener última actualización
    const lastRecord = await this.adresDataRepository.findOne({
      order: { updatedAt: 'DESC' }
    });

    // Contar EPS activas
    const activeEPS = await this.epsRepository.count({ where: { activa: true } });

    // Contar períodos activos
    const activePeriods = await this.periodoRepository.count({ where: { activo: true } });

    const health = {
      database: 'connected',
      recordsCount,
      lastUpdate: lastRecord?.updatedAt || null,
      activeEPS,
      activePeriods
    };

    console.log('✅ AdresService: Health check completed:', health);
    return health;
  } catch (error) {
    console.error('❌ AdresService: Health check failed:', error);
    throw new BadRequestException(`Error en health check: ${error.message}`);
  }
}
}
