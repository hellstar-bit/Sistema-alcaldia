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

      const statusArray = result.map(item => ({
        epsId: item.epsId,
        periodoId: item.periodoId,
        tieneData: parseInt(item.totalRegistros) > 0,
        totalRegistros: parseInt(item.totalRegistros) || 0,
        totalValorGirado: parseFloat(item.totalValorGirado) || 0
      }));

      console.log('📊 AdresService: Processed status array:', statusArray);
      console.log(`📊 AdresService: Found ${statusArray.length} EPS-Periodo combinations with data`);

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
}
