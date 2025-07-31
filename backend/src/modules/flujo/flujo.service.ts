import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlujoControlCarga } from './entities/flujo-control-carga.entity';
import { FlujoIpsData } from './entities/flujo-ips-data.entity';
import { FlujoEpsData } from './entities/flujo-eps-data.entity';
import { EPS } from '../cartera/entities/eps.entity';
import { IPS } from '../cartera/entities/ips.entity';
import { Periodo } from '../cartera/entities/periodo.entity';
import { AdresData } from '../adres/entities/adres-data.entity'; // NUEVO IMPORT
import { CreateFlujoIpsDataDto } from './dto/create-flujo-ips-data.dto';
import { CreateFlujoEpsDataDto } from './dto/create-flujo-eps-data.dto';
import { FlujoFilterDto } from './dto/flujo-filter.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class FlujoService {
  constructor(
    @InjectRepository(FlujoControlCarga)
    private flujoControlCargaRepository: Repository<FlujoControlCarga>,
    @InjectRepository(FlujoIpsData)
    private flujoIpsDataRepository: Repository<FlujoIpsData>,
    @InjectRepository(FlujoEpsData)
    private flujoEpsDataRepository: Repository<FlujoEpsData>,
    @InjectRepository(EPS)
    private epsRepository: Repository<EPS>,
    @InjectRepository(IPS)
    private ipsRepository: Repository<IPS>,
    @InjectRepository(Periodo)
    private periodoRepository: Repository<Periodo>,
    @InjectRepository(AdresData) // NUEVO REPOSITORIO
    private adresDataRepository: Repository<AdresData>,
  ) {}

  // ===============================================
  // MÉTODOS PARA CONTROL DE CARGA
  // ===============================================
  async getControlCargaGrid(): Promise<Array<{
  eps: EPS;
  periodos: Array<{
    periodo: Periodo;
    tieneData: boolean;
    totalRegistros: number;
  }>;
}>> {
  console.log('📊 FlujoService: getControlCargaGrid');

  try {
    const allEPS = await this.epsRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' }
    });

    const allPeriodos = await this.periodoRepository.find({
      where: { activo: true },
      order: { year: 'DESC', mes: 'DESC' }
    });

    // ✅ CORRECCIÓN: Verificar que los campos usen snake_case
    const dataStats = await this.flujoControlCargaRepository
      .createQueryBuilder('control')
      .leftJoin('control.ipsData', 'ipsData')
      .select([
        'control.eps_id as epsId',      // ✅ CORREGIDO: usar eps_id
        'control.periodo_id as periodoId', // ✅ CORREGIDO: usar periodo_id
        'COUNT(ipsData.id) as totalRegistros'
      ])
      .where('control.activo = :activo', { activo: true })
      .groupBy('control.eps_id, control.periodo_id') // ✅ CORREGIDO
      .getRawMany();

    console.log('🔍 DEBUG FLUJO: Raw SQL result:', dataStats);

    const result = allEPS.map(eps => ({
      eps,
      periodos: allPeriodos.map(periodo => {
        const stats = dataStats.find(
          // ✅ CORRECCIÓN: Usar nombres en lowercase que devuelve TypeORM
          stat => stat.epsid === eps.id && stat.periodoid === periodo.id
        );
        return {
          periodo,
          tieneData: stats ? parseInt(stats.totalregistros) > 0 : false,  // ✅ lowercase
          totalRegistros: stats ? parseInt(stats.totalregistros) : 0       // ✅ lowercase
        };
      })
    }));

    console.log('📊 FlujoService: Grid processed successfully');
    return result;
  } catch (error) {
    console.error('❌ FlujoService: Error in getControlCargaGrid:', error);
    throw new BadRequestException(`Error al obtener control de carga: ${error.message}`);
  }
}

  async findOrCreateControlCarga(epsId: string, periodoId: string): Promise<FlujoControlCarga> {
    let controlCarga = await this.flujoControlCargaRepository.findOne({
      where: { epsId, periodoId },
      relations: ['eps', 'periodo']
    });

    if (!controlCarga) {
      const eps = await this.epsRepository.findOne({ where: { id: epsId } });
      if (!eps) throw new NotFoundException('EPS no encontrada');

      const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
      if (!periodo) throw new NotFoundException('Período no encontrado');

      controlCarga = this.flujoControlCargaRepository.create({
        epsId,
        periodoId,
        activo: true
      });
      controlCarga = await this.flujoControlCargaRepository.save(controlCarga);
    }

    return controlCarga;
  }

  // ===============================================
  // MÉTODOS PARA DATOS DE IPS
  // ===============================================
  async getFlujoIpsData(filters: FlujoFilterDto): Promise<{
    data: FlujoIpsData[];
    total: number;
    totalValorFacturado: number;
    totalReconocido: number;
    totalPagado: number;
    totalSaldoAdeudado: number;
  }> {
    console.log('💰 FlujoService: getFlujoIpsData - Filters:', filters);

    try {
      const queryBuilder = this.flujoIpsDataRepository
        .createQueryBuilder('flujoIps')
        .leftJoinAndSelect('flujoIps.controlCarga', 'control')
        .leftJoinAndSelect('control.eps', 'eps')
        .leftJoinAndSelect('control.periodo', 'periodo')
        .leftJoinAndSelect('flujoIps.ips', 'ips')
        .where('flujoIps.activo = :activo', { activo: true });

      // Aplicar filtros
      if (filters.epsId) {
        queryBuilder.andWhere('control.epsId = :epsId', { epsId: filters.epsId });
      }

      if (filters.periodoId) {
        queryBuilder.andWhere('control.periodoId = :periodoId', { periodoId: filters.periodoId });
      }

      if (filters.ipsId) {
        queryBuilder.andWhere('flujoIps.ipsId = :ipsId', { ipsId: filters.ipsId });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(ips.nombre ILIKE :search OR ips.codigo ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Contar total
      const total = await queryBuilder.getCount();

      // Calcular totales
      const totalsResult = await this.flujoIpsDataRepository
        .createQueryBuilder('flujoIps')
        .leftJoin('flujoIps.controlCarga', 'control')
        .select([
          'SUM(flujoIps.valorFacturado) as totalValorFacturado',
          'SUM(flujoIps.reconocido) as totalReconocido',
          'SUM(flujoIps.valorPagado) as totalPagado',
          'SUM(flujoIps.saldoAdeudado) as totalSaldoAdeudado'
        ])
        .where('flujoIps.activo = :activo', { activo: true })
        .andWhere(filters.epsId ? 'control.epsId = :epsId' : '1=1', filters.epsId ? { epsId: filters.epsId } : {})
        .andWhere(filters.periodoId ? 'control.periodoId = :periodoId' : '1=1', filters.periodoId ? { periodoId: filters.periodoId } : {})
        .getRawOne();

      // Aplicar paginación
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      
      queryBuilder
        .orderBy('ips.nombre', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const data = await queryBuilder.getMany();

      return {
        data,
        total,
        totalValorFacturado: parseFloat(totalsResult.totalValorFacturado) || 0,
        totalReconocido: parseFloat(totalsResult.totalReconocido) || 0,
        totalPagado: parseFloat(totalsResult.totalPagado) || 0,
        totalSaldoAdeudado: parseFloat(totalsResult.totalSaldoAdeudado) || 0
      };
    } catch (error) {
      console.error('❌ FlujoService: Error in getFlujoIpsData:', error);
      throw new BadRequestException(`Error al obtener datos de flujo IPS: ${error.message}`);
    }
  }

  async createFlujoIpsData(createDto: CreateFlujoIpsDataDto): Promise<FlujoIpsData> {
    // Verificar que el control de carga existe
    const controlCarga = await this.flujoControlCargaRepository.findOne({
      where: { id: createDto.controlCargaId }
    });
    if (!controlCarga) {
      throw new NotFoundException('Control de carga no encontrado');
    }

    // Verificar que la IPS existe
    const ips = await this.ipsRepository.findOne({ where: { id: createDto.ipsId } });
    if (!ips) {
      throw new NotFoundException('IPS no encontrada');
    }

    // Verificar si ya existe un registro para esta combinación
    const existing = await this.flujoIpsDataRepository.findOne({
      where: {
        controlCargaId: createDto.controlCargaId,
        ipsId: createDto.ipsId
      }
    });

    if (existing) {
      // Actualizar el registro existente
      Object.assign(existing, createDto);
      return await this.flujoIpsDataRepository.save(existing);
    }

    const flujoIpsData = this.flujoIpsDataRepository.create(createDto);
    return await this.flujoIpsDataRepository.save(flujoIpsData);
  }

  // ===============================================
  // MÉTODOS PARA DATOS DE EPS
  // ===============================================
  async getFlujoEpsData(epsId: string, periodoId: string): Promise<FlujoEpsData | null> {
    const controlCarga = await this.flujoControlCargaRepository.findOne({
      where: { epsId, periodoId }
    });

    if (!controlCarga) return null;

    return await this.flujoEpsDataRepository.findOne({
      where: { controlCargaId: controlCarga.id },
      relations: ['controlCarga']
    });
  }

  async createOrUpdateFlujoEpsData(createDto: CreateFlujoEpsDataDto): Promise<FlujoEpsData> {
    // Verificar si ya existe
    const existing = await this.flujoEpsDataRepository.findOne({
      where: { controlCargaId: createDto.controlCargaId }
    });

    if (existing) {
      Object.assign(existing, createDto);
      return await this.flujoEpsDataRepository.save(existing);
    }

    const flujoEpsData = this.flujoEpsDataRepository.create(createDto);
    return await this.flujoEpsDataRepository.save(flujoEpsData);
  }

  // ===============================================
  // NUEVO: MÉTODOS PARA INFORMACIÓN ADRES-FLUJO
  // ===============================================
  async getEpsAdresInfo(epsId: string): Promise<Array<{
  eps: string;
  periodo: string;
  upc: number;
  upc92: number;
  upc60: number;
  valorGirado: number;
  pagos: number;
  cumplimientoPagos: number;
}>> {
  console.log('🔍 FlujoService: getEpsAdresInfo - Obteniendo información de ADRES para EPS:', epsId);

  try {
    // Primero verificar que la EPS existe
    const eps = await this.epsRepository.findOne({ where: { id: epsId } });
    if (!eps) {
      throw new BadRequestException('EPS no encontrada');
    }

    // Consultar datos de ADRES para esta EPS
    const adresData = await this.adresDataRepository
      .createQueryBuilder('adres')
      .leftJoinAndSelect('adres.eps', 'eps')
      .leftJoinAndSelect('adres.periodo', 'periodo')
      .where('adres.epsId = :epsId', { epsId })
      .andWhere('adres.activo = :activo', { activo: true })
      .orderBy('periodo.year', 'DESC')
      .addOrderBy('periodo.mes', 'DESC')
      .getMany();

    console.log(`📊 FlujoService: Encontrados ${adresData.length} registros de ADRES para la EPS`);

    // Para cada período de ADRES, calcular los pagos desde flujo IPS
    const result = await Promise.all(
      adresData.map(async (item) => {
        console.log(`🔍 Procesando período: ${item.periodo.nombre} ${item.periodo.year} para EPS ID: ${epsId}`);
        
        // Buscar datos de flujo IPS para esta EPS y período
        const flujoIpsData = await this.flujoIpsDataRepository
          .createQueryBuilder('flujoIps')
          .leftJoin('flujoIps.controlCarga', 'control')
          .select([
            'flujoIps.valorPagado'
          ])
          .where('control.epsId = :epsId', { epsId })
          .andWhere('control.periodoId = :periodoId', { periodoId: item.periodo.id })
          .andWhere('flujoIps.activo = :activo', { activo: true })
          .getRawMany();

        console.log(`💰 Registros de flujo IPS encontrados para período ${item.periodo.nombre}:`, flujoIpsData.length);
        console.log(`💰 Datos de flujo IPS:`, flujoIpsData);

        // Calcular la suma de pagos con validación robusta
        let totalPagos = 0;
        
        if (flujoIpsData && flujoIpsData.length > 0) {
          totalPagos = flujoIpsData.reduce((sum, flujoItem) => {
            const valorPagado = parseFloat(flujoItem.flujoIps_valorPagado) || 0;
            console.log(`💰 Sumando valor pagado: ${valorPagado}`);
            return sum + valorPagado;
          }, 0);
        }

        console.log(`💰 Total pagos calculado para período ${item.periodo.nombre}: ${totalPagos}`);

        // Calcular el 92% del UPC con validación
        const upcValue = parseFloat(item.upc.toString()) || 0;
        const upc92 = Math.round(upcValue * 0.92 * 100) / 100;
        
        // Calcular el cumplimiento de pagos (porcentaje) con validación
        let cumplimientoPagos = 0;
        if (upc92 > 0 && !isNaN(totalPagos) && totalPagos >= 0) {
          cumplimientoPagos = Math.round((totalPagos / upc92) * 100 * 100) / 100;
        }

        console.log(`📊 Período ${item.periodo.nombre}: UPC=${upcValue}, UPC92=${upc92}, Pagos=${totalPagos}, Cumplimiento=${cumplimientoPagos}%`);

        return {
          eps: item.eps.nombre,
          periodo: `${item.periodo.nombre} ${item.periodo.year}`,
          upc: upcValue,
          upc92: upc92,
          upc60: Math.round(upcValue * 0.60 * 100) / 100,
          valorGirado: parseFloat(item.valorGirado.toString()) || 0,
          pagos: isNaN(totalPagos) ? 0 : totalPagos, // ✅ VALIDACIÓN ANTI-NaN
          cumplimientoPagos: isNaN(cumplimientoPagos) ? 0 : cumplimientoPagos // ✅ VALIDACIÓN ANTI-NaN
        };
      })
    );

    console.log('✅ FlujoService: Información de ADRES con pagos procesada exitosamente');
    return result;

  } catch (error) {
    console.error('❌ FlujoService: Error en getEpsAdresInfo:', error);
    throw new BadRequestException(`Error al obtener información de ADRES: ${error.message}`);
  }
}

  // ===============================================
  // MÉTODOS PARA EXCEL
  // ===============================================
  async generatePlantillaExcel(): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    const plantillaData = [
      [
        'Prestador', 'Incremento Porcentual', 'Tipo de Contrato', 'Fecha contrato',
        'Valor facturado', 'Valor Glosa', 'Vr reconocido', 'Valor Pagado',
        'Fecha pago', 'Saldo adeudado del periodo', 'Saldo Total adeudado a la IPS',
        'Origen del Giro'
      ],
      [
        'Ejemplo IPS 1', '5.2', 'Capita', '2024-01-15',
        '10000000', '500000', '9500000', '8000000',
        '2024-02-15', '1500000', '2000000', 'Banco Popular'
      ],
      [
        'Ejemplo IPS 2', '4.8', 'Evento', '2024-01-20',
        '15000000', '750000', '14250000', '12000000',
        '2024-02-20', '2250000', '3000000', 'Bancolombia'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(plantillaData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 30 }, // Prestador
      { wch: 15 }, // Incremento
      { wch: 20 }, // Tipo Contrato
      { wch: 15 }, // Fecha contrato
      { wch: 15 }, // Valor facturado
      { wch: 15 }, // Valor Glosa
      { wch: 15 }, // Vr reconocido
      { wch: 15 }, // Valor Pagado
      { wch: 15 }, // Fecha pago
      { wch: 20 }, // Saldo adeudado
      { wch: 25 }, // Saldo Total
      { wch: 20 }, // Origen del Giro
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Flujo');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async processExcelUpload(
    buffer: Buffer,
    epsId: string,
    periodoId: string
  ): Promise<{
    success: boolean;
    message: string;
    processed: number;
    errors: string[];
  }> {
    try {
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const errors: string[] = [];
      let processed = 0;

      // Crear o encontrar el control de carga
      const controlCarga = await this.findOrCreateControlCarga(epsId, periodoId);

      // Procesar filas (saltar headers)
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        
        if (!row || row.length === 0) continue;

        try {
          const [
            prestador, incremento, tipoContrato, fechaContrato,
            valorFacturado, valorGlosa, reconocido, valorPagado,
            fechaPago, saldoAdeudado, saldoTotal, origenGiro
          ] = row;

          if (!prestador) {
            errors.push(`Fila ${i + 1}: Prestador es requerido`);
            continue;
          }

          // Buscar o crear IPS
          const ips = await this.findOrCreateIPS(prestador);

          // Convertir fechas
          const fechaContratoDate = fechaContrato ? new Date(fechaContrato) : null;
          const fechaPagoDate = fechaPago ? new Date(fechaPago) : null;

          // ✅ OBJETO CORREGIDO CON undefined EN LUGAR DE null
          const flujoIpsData = {
            controlCargaId: controlCarga.id,
            ipsId: ips.id,
            incremento: parseFloat(incremento) || 0,
            tipoContrato: tipoContrato || undefined,
            fechaContrato: fechaContratoDate ? fechaContratoDate.toISOString().split('T')[0] : undefined,
            valorFacturado: parseFloat(valorFacturado) || 0,
            valorGlosa: parseFloat(valorGlosa) || 0,
            reconocido: parseFloat(reconocido) || 0,
            valorPagado: parseFloat(valorPagado) || 0,
            fechaPago: fechaPagoDate ? fechaPagoDate.toISOString().split('T')[0] : undefined,
            saldoAdeudado: parseFloat(saldoAdeudado) || 0,
            saldoTotal: parseFloat(saldoTotal) || 0,
            orden: undefined,
            giro: origenGiro || undefined
          };

          await this.createFlujoIpsData(flujoIpsData);
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

  async exportFlujoToExcel(filters: FlujoFilterDto): Promise<Buffer> {
    const { data } = await this.getFlujoIpsData({ ...filters, page: 1, limit: 10000 });
    
    const excelData = data.map(item => ({
      'EPS': item.controlCarga.eps.nombre,
      'IPS_CODIGO': item.ips.codigo,
      'IPS_NOMBRE': item.ips.nombre,
      'PERIODO': `${item.controlCarga.periodo.nombre} ${item.controlCarga.periodo.year}`,
      'INCREMENTO': item.incremento,
      'TIPO_CONTRATO': item.tipoContrato || '',
      'FECHA_CONTRATO': item.fechaContrato || '',
      'VALOR_FACTURADO': item.valorFacturado,
      'VALOR_GLOSA': item.valorGlosa,
      'RECONOCIDO': item.reconocido,
      'VALOR_PAGADO': item.valorPagado,
      'FECHA_PAGO': item.fechaPago || '',
      'SALDO_ADEUDADO': item.saldoAdeudado,
      'SALDO_TOTAL': item.saldoTotal,
      'ORDEN': item.orden || '',
      'GIRO': item.giro || '',
      'OBSERVACIONES': item.observaciones || '',
      'FECHA_CREACION': item.createdAt.toLocaleDateString('es-CO')
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 20 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
      { wch: 25 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flujo Export');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // ===============================================
  // MÉTODOS AUXILIARES
  // ===============================================
  private async findOrCreateIPS(nombre: string): Promise<IPS> {
    let ips = await this.ipsRepository.findOne({
      where: { nombre }
    });

    if (!ips) {
      ips = this.ipsRepository.create({
        codigo: `IPS_${Date.now()}`,
        nombre,
        activa: true
      });
      ips = await this.ipsRepository.save(ips);
    }

    return ips;
  }

  async deleteFlujoPeriodoData(epsId: string, periodoId: string): Promise<{ deletedCount: number }> {
    console.log('🗑️ FlujoService: deleteFlujoPeriodoData', { epsId, periodoId });

    try {
      const controlCarga = await this.flujoControlCargaRepository.findOne({
        where: { epsId, periodoId }
      });

      if (!controlCarga) {
        throw new BadRequestException('No hay datos para eliminar en este período');
      }

      // Eliminar datos de IPS
      const deleteIpsResult = await this.flujoIpsDataRepository
        .createQueryBuilder()
        .delete()
        .from(FlujoIpsData)
        .where('controlCargaId = :controlCargaId', { controlCargaId: controlCarga.id })
        .execute();

      // Eliminar datos de EPS
      await this.flujoEpsDataRepository
        .createQueryBuilder()
        .delete()
        .from(FlujoEpsData)
        .where('controlCargaId = :controlCargaId', { controlCargaId: controlCarga.id })
        .execute();

      // Eliminar control de carga
      await this.flujoControlCargaRepository.remove(controlCarga);

      return {
        deletedCount: deleteIpsResult.affected || 0
      };

    } catch (error) {
      console.error('❌ FlujoService: Error in deleteFlujoPeriodoData:', error);
      throw new BadRequestException(`Error al eliminar datos del período: ${error.message}`);
    }
  }
}
