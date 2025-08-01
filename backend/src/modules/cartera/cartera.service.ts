// backend/src/modules/cartera/cartera.service.ts - VERSIÓN CORREGIDA CON TIPOS EXPLÍCITOS
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EPS } from './entities/eps.entity';
import { IPS } from './entities/ips.entity';
import { Periodo } from './entities/periodo.entity';
import { CarteraData } from './entities/cartera-data.entity';
import { CreateCarteraDataDto } from './dto/create-cartera-data.dto';
import { CarteraFilterDto } from './dto/cartera-filter.dto';

// ===============================================
// INTERFACES INTERNAS TIPADAS
// ===============================================
interface CarteraTrazabilidadDto {
  epsId?: string;
  ipsId?: string;
  periodoId?: string;
  incluirHistorico?: boolean;
  page?: number;
  limit?: number;
}

interface CarteraResumenDto {
  totalCartera: number;
  totalEPS: number;
  totalIPS: number;
  totalRegistros: number;
  variacionPeriodoAnterior?: number;
  variacionPorcentual?: number;
}

interface TrazabilidadItem {
  epsId: string;
  ipsId: string;
  valorActual: number;
  valorAnterior?: number | null;
  variacion?: number;
  variacionPorcentual?: number;
  historicoCompleto?: Array<{
    periodo: string;
    valor: number;
    fecha: Date;
  }>;
}

interface ResumenPeriodo {
  periodo: string;
  year: number;
  mes: number;
  totalCartera: number;
  totalEPS: number;
  totalIPS: number;
  variacionAnterior: number;
}

interface TopEntidad {
  id: string;
  nombre: string;
  carteraTotal: number;
  cantidadRelaciones: number;
  porcentajeTotal: number;
}

interface ValidacionResultado {
  isValid: boolean;
  errores: string[];
  advertencias: string[];
  estadisticas: {
    totalRegistros: number;
    registrosDuplicados: number;
    relacionesUnicas: number;
  };
}

interface MigracionResultado {
  success: boolean;
  registrosProcesados: number;
  registrosLimpiados: number;
  mensaje: string;
}

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
  // ✅ MÉTODO CORREGIDO: CARTERA CON TRAZABILIDAD
  // ===============================================
  async getCarteraConTrazabilidad(filters: CarteraTrazabilidadDto): Promise<{
    data: any[];
    resumen: CarteraResumenDto;
    trazabilidad: TrazabilidadItem[];
  }> {
    console.log('📊 CarteraService: getCarteraConTrazabilidad - NUEVA LÓGICA CORREGIDA');
    
    try {
      // 1. OBTENER ÚLTIMO VALOR POR CADA RELACIÓN EPS-IPS (NO SUMAR TODO)
      const carteraActualQuery = this.carteraDataRepository
        .createQueryBuilder('cartera')
        .leftJoinAndSelect('cartera.eps', 'eps')
        .leftJoinAndSelect('cartera.ips', 'ips')
        .leftJoinAndSelect('cartera.periodo', 'periodo')
        .where('cartera.activo = :activo', { activo: true });

      // Aplicar filtros
      if (filters.epsId) {
        carteraActualQuery.andWhere('cartera.epsId = :epsId', { epsId: filters.epsId });
      }
      if (filters.ipsId) {
        carteraActualQuery.andWhere('cartera.ipsId = :ipsId', { ipsId: filters.ipsId });
      }
      if (filters.periodoId) {
        carteraActualQuery.andWhere('cartera.periodoId = :periodoId', { periodoId: filters.periodoId });
      }

      // ✅ CORRECCIÓN CRÍTICA: Obtener solo el último registro por cada EPS-IPS
      const carteraRaw = await carteraActualQuery
        .addSelect('ROW_NUMBER() OVER (PARTITION BY cartera.epsId, cartera.ipsId ORDER BY periodo.year DESC, periodo.mes DESC)', 'rn')
        .getRawAndEntities();

      // Filtrar solo los registros más recientes (rn = 1)
      const carteraActual = carteraRaw.entities.filter((_, index) => 
        carteraRaw.raw[index].rn === 1
      );

      console.log(`✅ Registros únicos por EPS-IPS (sin duplicar): ${carteraActual.length}`);

      // 2. CALCULAR TRAZABILIDAD Y VARIACIONES
      const trazabilidadMap = new Map<string, TrazabilidadItem>();
      
      for (const carteraItem of carteraActual) {
        const key = `${carteraItem.epsId}-${carteraItem.ipsId}`;
        
        // Obtener histórico si se solicita
        let historicoCompleto: Array<{ periodo: string; valor: number; fecha: Date }> = [];
        let valorAnterior: number | null = null;
        
        if (filters.incluirHistorico) {
          const historico = await this.carteraDataRepository
            .createQueryBuilder('cartera')
            .leftJoinAndSelect('cartera.periodo', 'periodo')
            .where('cartera.epsId = :epsId', { epsId: carteraItem.epsId })
            .andWhere('cartera.ipsId = :ipsId', { ipsId: carteraItem.ipsId })
            .andWhere('cartera.activo = :activo', { activo: true })
            .orderBy('periodo.year', 'DESC')
            .addOrderBy('periodo.mes', 'DESC')
            .take(12) // Últimos 12 períodos
            .getMany();

          historicoCompleto = historico.map(h => ({
            periodo: `${h.periodo.nombre} ${h.periodo.year}`,
            valor: h.total,
            fecha: new Date(h.periodo.year, h.periodo.mes - 1)
          }));

          // Valor del período anterior para calcular variación
          if (historico.length > 1) {
            valorAnterior = historico[1].total;
          }
        }

        const valorActual = carteraItem.total;
        const variacion = valorAnterior !== null ? valorActual - valorAnterior : undefined;
        const variacionPorcentual = valorAnterior !== null && valorAnterior > 0 
          ? (variacion! / valorAnterior) * 100 
          : undefined;

        const trazabilidadItem: TrazabilidadItem = {
          epsId: carteraItem.epsId,
          ipsId: carteraItem.ipsId,
          valorActual,
          valorAnterior,
          variacion,
          variacionPorcentual,
          historicoCompleto: filters.incluirHistorico ? historicoCompleto : undefined
        };

        trazabilidadMap.set(key, trazabilidadItem);
      }

      // 3. CALCULAR RESUMEN CORRECTO (SIN DOBLE CONTABILIZACIÓN)
      const totalCartera = carteraActual.reduce((sum, item) => sum + item.total, 0);
      const totalEPS = new Set(carteraActual.map(item => item.epsId)).size;
      const totalIPS = new Set(carteraActual.map(item => item.ipsId)).size;

      // Calcular variación total del período anterior
      let variacionTotalAnterior: number | undefined = undefined;
      if (filters.incluirHistorico) {
        const valoresAnteriores = Array.from(trazabilidadMap.values())
          .filter(t => t.valorAnterior !== null && t.valorAnterior !== undefined)
          .reduce((sum, t) => sum + (t.valorAnterior || 0), 0);
        
        if (valoresAnteriores > 0) {
          variacionTotalAnterior = ((totalCartera - valoresAnteriores) / valoresAnteriores) * 100;
        }
      }

      const resumen: CarteraResumenDto = {
        totalCartera,
        totalEPS,
        totalIPS,
        totalRegistros: carteraActual.length,
        variacionPeriodoAnterior: variacionTotalAnterior,
        variacionPorcentual: variacionTotalAnterior
      };

      // 4. APLICAR PAGINACIÓN A LOS DATOS
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const startIndex = (page - 1) * limit;
      const paginatedData = carteraActual.slice(startIndex, startIndex + limit);

      console.log(`✅ CarteraService: Trazabilidad calculada correctamente`);
      console.log(`   - Total cartera real: ${totalCartera.toLocaleString()}`);
      console.log(`   - EPS únicas: ${totalEPS}`);
      console.log(`   - IPS únicas: ${totalIPS}`);
      console.log(`   - Registros únicos: ${carteraActual.length}`);

      return {
        data: paginatedData,
        resumen,
        trazabilidad: Array.from(trazabilidadMap.values())
      };

    } catch (error) {
      console.error('❌ CarteraService: Error en getCarteraConTrazabilidad:', error);
      throw new BadRequestException(`Error al obtener cartera con trazabilidad: ${error.message}`);
    }
  }

  // ===============================================
  // ✅ MÉTODO CORREGIDO: RESUMEN POR PERÍODO SIN DUPLICADOS
  // ===============================================
  async getResumenPorPeriodo(periodoId?: string): Promise<ResumenPeriodo[]> {
    console.log('📊 CarteraService: getResumenPorPeriodo - LÓGICA CORREGIDA');

    try {
      // Obtener períodos disponibles
      const periodosQuery = this.periodoRepository
        .createQueryBuilder('periodo')
        .where('periodo.activo = :activo', { activo: true })
        .orderBy('periodo.year', 'DESC')
        .addOrderBy('periodo.mes', 'DESC');

      if (periodoId) {
        periodosQuery.andWhere('periodo.id = :periodoId', { periodoId });
      } else {
        periodosQuery.take(12); // Últimos 12 períodos
      }

      const periodos = await periodosQuery.getMany();
      const resumenPorPeriodo: ResumenPeriodo[] = [];

      for (let i = 0; i < periodos.length; i++) {
        const periodo = periodos[i];
        
        // ✅ CORRECCIÓN: Usar trazabilidad para obtener valor real del período
        const { resumen } = await this.getCarteraConTrazabilidad({
          periodoId: periodo.id,
          incluirHistorico: false
        });

        // Calcular variación con período anterior
        let variacionAnterior = 0;
        if (i < periodos.length - 1) {
          const periodoAnterior = periodos[i + 1];
          const { resumen: resumenAnterior } = await this.getCarteraConTrazabilidad({
            periodoId: periodoAnterior.id,
            incluirHistorico: false
          });

          if (resumenAnterior.totalCartera > 0) {
            variacionAnterior = ((resumen.totalCartera - resumenAnterior.totalCartera) / resumenAnterior.totalCartera) * 100;
          }
        }

        const resumenItem: ResumenPeriodo = {
          periodo: `${periodo.nombre} ${periodo.year}`,
          year: periodo.year,
          mes: periodo.mes,
          totalCartera: resumen.totalCartera,
          totalEPS: resumen.totalEPS,
          totalIPS: resumen.totalIPS,
          variacionAnterior
        };

        resumenPorPeriodo.push(resumenItem);
      }

      console.log(`✅ Resumen por período calculado para ${resumenPorPeriodo.length} períodos`);
      return resumenPorPeriodo;

    } catch (error) {
      console.error('❌ Error calculando resumen por período:', error);
      throw new BadRequestException(`Error al calcular resumen por período: ${error.message}`);
    }
  }

  // ===============================================
  // ✅ MÉTODO CORREGIDO: TOP EPS/IPS SIN DUPLICAR DEUDAS
  // ===============================================
  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10): Promise<TopEntidad[]> {
    console.log(`📊 CarteraService: getTopEntidades - ${tipo.toUpperCase()} (LÓGICA CORREGIDA)`);

    try {
      // Obtener cartera con trazabilidad (sin duplicados)
      const { trazabilidad } = await this.getCarteraConTrazabilidad({
        incluirHistorico: false
      });

      // Agrupar por entidad (EPS o IPS)
      const agrupacion = new Map<string, {
        id: string;
        nombre: string;
        carteraTotal: number;
        cantidadRelaciones: number;
      }>();

      // Obtener datos de las entidades para nombres
      const entidades = tipo === 'eps' 
        ? await this.epsRepository.find({ where: { activa: true } })
        : await this.ipsRepository.find({ where: { activa: true } });

      // ✅ CORRECCIÓN: Mapear correctamente con tipos explícitos
      const entidadesMap = new Map<string, string>();
      entidades.forEach(entidad => {
        entidadesMap.set(entidad.id, entidad.nombre);
      });

      trazabilidad.forEach(item => {
        const entidadId = tipo === 'eps' ? item.epsId : item.ipsId;
        const nombreEntidad = entidadesMap.get(entidadId) || `${tipo.toUpperCase()} ${entidadId.substring(0, 8)}`;

        if (!agrupacion.has(entidadId)) {
          agrupacion.set(entidadId, {
            id: entidadId,
            nombre: nombreEntidad,
            carteraTotal: 0,
            cantidadRelaciones: 0
          });
        }

        const entidadData = agrupacion.get(entidadId)!;
        entidadData.carteraTotal += item.valorActual;
        entidadData.cantidadRelaciones += 1;
      });

      // Calcular total para porcentajes
      const totalGeneral = Array.from(agrupacion.values()).reduce((sum, item) => sum + item.carteraTotal, 0);

      // Ordenar y limitar
      const resultado: TopEntidad[] = Array.from(agrupacion.values())
        .map(item => ({
          id: item.id,
          nombre: item.nombre,
          carteraTotal: item.carteraTotal,
          cantidadRelaciones: item.cantidadRelaciones,
          porcentajeTotal: totalGeneral > 0 ? (item.carteraTotal / totalGeneral) * 100 : 0
        }))
        .sort((a, b) => b.carteraTotal - a.carteraTotal)
        .slice(0, limit);

      console.log(`✅ Top ${limit} ${tipo.toUpperCase()} calculado correctamente`);
      return resultado;

    } catch (error) {
      console.error(`❌ Error obteniendo top ${tipo}:`, error);
      throw new BadRequestException(`Error al obtener top ${tipo}: ${error.message}`);
    }
  }

  // ===============================================
  // MÉTODOS AUXILIARES MEJORADOS
  // ===============================================
  async validarConsistenciaCartera(): Promise<ValidacionResultado> {
    console.log('🔍 CarteraService: Validando consistencia de cartera...');

    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Contar registros totales
      const totalRegistros = await this.carteraDataRepository.count({
        where: { activo: true }
      });

      // Detectar posibles duplicados (mismo EPS-IPS-PERIODO)
      const duplicados = await this.carteraDataRepository
        .createQueryBuilder('cartera')
        .select(['cartera.epsId', 'cartera.ipsId', 'cartera.periodoId', 'COUNT(*) as count'])
        .where('cartera.activo = :activo', { activo: true })
        .groupBy('cartera.epsId, cartera.ipsId, cartera.periodoId')
        .having('COUNT(*) > 1')
        .getRawMany();

      // Contar relaciones únicas
      const relacionesUnicas = await this.carteraDataRepository
        .createQueryBuilder('cartera')
        .select(['cartera.epsId', 'cartera.ipsId'])
        .distinct(true)
        .where('cartera.activo = :activo', { activo: true })
        .getCount();

      if (duplicados.length > 0) {
        errores.push(`Se encontraron ${duplicados.length} combinaciones EPS-IPS-PERÍODO duplicadas`);
      }

      // Validar valores negativos usando QueryBuilder
      const valoresNegativos = await this.carteraDataRepository
        .createQueryBuilder('cartera')
        .where('cartera.activo = :activo', { activo: true })
        .andWhere('cartera.total < :minValue', { minValue: 0 })
        .getCount();

      if (valoresNegativos > 0) {
        advertencias.push(`Se encontraron ${valoresNegativos} registros con valores negativos`);
      }

      const isValid = errores.length === 0;

      console.log(`✅ Validación completada. Válido: ${isValid}, Errores: ${errores.length}, Advertencias: ${advertencias.length}`);

      const resultado: ValidacionResultado = {
        isValid,
        errores,
        advertencias,
        estadisticas: {
          totalRegistros,
          registrosDuplicados: duplicados.length,
          relacionesUnicas
        }
      };

      return resultado;

    } catch (error) {
      console.error('❌ Error validando consistencia:', error);
      throw new BadRequestException(`Error al validar consistencia: ${error.message}`);
    }
  }

  // ===============================================
  // MÉTODO PARA MIGRAR DATOS EXISTENTES (UNA VEZ)
  // ===============================================
  async migrarANuevaLogica(): Promise<MigracionResultado> {
    console.log('🔄 CarteraService: Iniciando migración a nueva lógica...');

    try {
      // 1. Identificar duplicados por EPS-IPS-PERÍODO
      const duplicados = await this.carteraDataRepository
        .createQueryBuilder('cartera')
        .select(['cartera.epsId', 'cartera.ipsId', 'cartera.periodoId'])
        .addSelect('COUNT(*)', 'count')
        .addSelect('MAX(cartera.updatedAt)', 'ultimaActualizacion')
        .where('cartera.activo = :activo', { activo: true })
        .groupBy('cartera.epsId, cartera.ipsId, cartera.periodoId')
        .having('COUNT(*) > 1')
        .getRawMany();

      let registrosLimpiados = 0;

      // 2. Para cada grupo de duplicados, mantener solo el más reciente
      for (const duplicado of duplicados) {
        const registrosDuplicados = await this.carteraDataRepository.find({
          where: {
            epsId: duplicado.cartera_epsId,
            ipsId: duplicado.cartera_ipsId,
            periodoId: duplicado.cartera_periodoId,
            activo: true
          },
          order: { updatedAt: 'DESC' }
        });

        // Mantener el primer registro (más reciente) y desactivar los demás
        for (let i = 1; i < registrosDuplicados.length; i++) {
          registrosDuplicados[i].activo = false;
          await this.carteraDataRepository.save(registrosDuplicados[i]);
          registrosLimpiados++;
        }
      }

      const totalRegistros = await this.carteraDataRepository.count({
        where: { activo: true }
      });

      console.log(`✅ Migración completada. Registros limpiados: ${registrosLimpiados}`);

      const resultado: MigracionResultado = {
        success: true,
        registrosProcesados: totalRegistros,
        registrosLimpiados,
        mensaje: `Migración exitosa. Se limpiaron ${registrosLimpiados} registros duplicados de ${totalRegistros} totales.`
      };

      return resultado;

    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw new BadRequestException(`Error en migración: ${error.message}`);
    }
  }

  // ===============================================
  // OTROS MÉTODOS EXISTENTES (MANTENER COMPATIBILIDAD)
  // ===============================================
  async getAllEPS(): Promise<EPS[]> {
    return await this.epsRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' }
    });
  }

  async getAllIPS(): Promise<IPS[]> {
    return await this.ipsRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' }
    });
  }

  async getAllPeriodos(): Promise<Periodo[]> {
    return await this.periodoRepository.find({
      where: { activo: true },
      order: { year: 'DESC', mes: 'DESC' }
    });
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
      // Actualizar el registro existente
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

  // Método helper para encontrar o crear EPS
  async findOrCreateEPS(nombre: string, codigo?: string): Promise<EPS> {
    let eps = await this.epsRepository.findOne({ where: { nombre } });

    if (!eps) {
      eps = this.epsRepository.create({
        codigo: codigo || `EPS_${Date.now()}`,
        nombre,
        activa: true
      });
      eps = await this.epsRepository.save(eps);
    }

    return eps;
  }

  // Método helper para encontrar o crear IPS
  async findOrCreateIPS(nombre: string, codigo?: string): Promise<IPS> {
    let ips = await this.ipsRepository.findOne({ where: { nombre } });

    if (!ips) {
      ips = this.ipsRepository.create({
        codigo: codigo || `IPS_${Date.now()}`,
        nombre,
        activa: true
      });
      ips = await this.ipsRepository.save(ips);
    }

    return ips;
  }
  // Agregar estos métodos al final de backend/src/modules/cartera/cartera.service.ts

  // ===============================================
  // MÉTODOS FALTANTES PARA EL CONTROLADOR
  // ===============================================

  /**
   * Obtener estado de EPS por período
   */
  async getEPSPeriodoStatus(): Promise<Array<{
    epsId: string;
    periodoId: string;
    tieneData: boolean;
    totalRegistros: number;
    totalCartera: number;
  }>> {
    console.log('📊 CarteraService: getEPSPeriodoStatus - Calculando estado...');

    try {
      const result = await this.carteraDataRepository
        .createQueryBuilder('cartera')
        .select([
          'cartera.epsId as epsId',
          'cartera.periodoId as periodoId', 
          'COUNT(cartera.id) as totalRegistros',
          'SUM(cartera.total) as totalCartera'
        ])
        .where('cartera.activo = :activo', { activo: true })
        .groupBy('cartera.epsId, cartera.periodoId')
        .getRawMany();

      const statusArray = result.map(item => ({
        epsId: item.epsid,
        periodoId: item.periodoid,
        tieneData: parseInt(item.totalregistros) > 0,
        totalRegistros: parseInt(item.totalregistros) || 0,
        totalCartera: parseFloat(item.totalcartera) || 0
      }));

      console.log(`✅ Estado calculado para ${statusArray.length} combinaciones EPS-Período`);
      return statusArray;

    } catch (error) {
      console.error('❌ Error calculando estado EPS-Período:', error);
      throw new BadRequestException(`Error al calcular estado: ${error.message}`);
    }
  }

  /**
   * Generar plantilla Excel para carga
   */
  async generatePlantillaExcel(): Promise<Buffer> {
    console.log('📄 CarteraService: Generando plantilla Excel...');

    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      
      const plantillaData = [
        [
          'IPS', 'A30', 'A60', 'A90', 'A120', 'A180', 'A360', 'SUP360', 'TOTAL'
        ],
        [
          'Ejemplo IPS 1', '1000000', '500000', '300000', '200000', '100000', '50000', '25000', '2175000'
        ],
        [
          'Ejemplo IPS 2', '800000', '400000', '250000', '150000', '75000', '30000', '15000', '1720000'
        ]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(plantillaData);
      
      // Configurar ancho de columnas
      const colWidths = [
        { wch: 25 }, // IPS
        { wch: 12 }, // A30
        { wch: 12 }, // A60
        { wch: 12 }, // A90
        { wch: 12 }, // A120
        { wch: 12 }, // A180
        { wch: 12 }, // A360
        { wch: 12 }, // SUP360
        { wch: 15 }  // TOTAL
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Cartera');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      console.log('✅ Plantilla Excel generada exitosamente');
      
      return buffer;

    } catch (error) {
      console.error('❌ Error generando plantilla Excel:', error);
      throw new BadRequestException(`Error al generar plantilla: ${error.message}`);
    }
  }

  /**
   * Procesar carga de Excel
   */
  async processExcelUpload(
    fileBuffer: Buffer, 
    epsId: string, 
    periodoId: string
  ): Promise<{
    success: boolean;
    message: string;
    processed: number;
    errors: string[];
  }> {
    console.log('📤 CarteraService: Procesando carga Excel...', { epsId, periodoId });

    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const errors: string[] = [];
      let processed = 0;

      // Validar que EPS y período existan
      const eps = await this.epsRepository.findOne({ where: { id: epsId } });
      if (!eps) {
        throw new BadRequestException('EPS no encontrada');
      }

      const periodo = await this.periodoRepository.findOne({ where: { id: periodoId } });
      if (!periodo) {
        throw new BadRequestException('Período no encontrado');
      }

      // Procesar datos (saltar la primera fila - headers)
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        
        if (!row || row.length === 0) continue;

        try {
          const [nombreIPS, a30, a60, a90, a120, a180, a360, sup360] = row;

          if (!nombreIPS) {
            errors.push(`Fila ${i + 1}: Nombre de IPS es requerido`);
            continue;
          }

          // Buscar o crear IPS
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

          // Validar que al menos un valor sea mayor a 0
          const totalCalculado = Object.values(valoresCartera).reduce((sum, val) => sum + val, 0);
          if (totalCalculado === 0) {
            errors.push(`Fila ${i + 1}: "${nombreIPS}" - Todos los valores son 0`);
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

      const success = processed > 0;
      const message = success 
        ? `Procesados ${processed} registros exitosamente${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
        : `No se procesaron registros. ${errors.length} errores encontrados`;

      console.log(`✅ Procesamiento completado: ${processed} registros, ${errors.length} errores`);

      return {
        success,
        message,
        processed,
        errors
      };

    } catch (error) {
      console.error('❌ Error procesando Excel:', error);
      throw new BadRequestException(`Error al procesar archivo: ${error.message}`);
    }
  }

  /**
   * Exportar cartera a Excel
   */
  async exportCarteraToExcel(filters: any): Promise<Buffer> {
    console.log('📋 CarteraService: Exportando cartera a Excel...');

    try {
      const XLSX = require('xlsx');
      
      // Obtener datos de cartera con filtros
      const { data } = await this.getCarteraData({
        epsId: filters.epsId,
        periodoId: filters.periodoId,
        ipsId: filters.ipsId,
        limit: 10000 // Obtener todos los datos para exportación
      });

      // Preparar datos para Excel
      const excelData: (string | number)[][] = [
  [
    'EPS', 'IPS', 'Período', 'A30', 'A60', 'A90', 'A120', 'A180', 'A360', 'SUP360', 'TOTAL', 'Observaciones'
  ]
];

data.forEach(item => {
  excelData.push([
    item.eps.nombre,
    item.ips.nombre,
    `${item.periodo.nombre} ${item.periodo.year}`,
    item.a30,      // ✅ Ahora acepta numbers
    item.a60,
    item.a90,
    item.a120,
    item.a180,
    item.a360,
    item.sup360,
    item.total,
    item.observaciones || ''
  ]);
});
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Configurar ancho de columnas
      const colWidths = [
        { wch: 20 }, // EPS
        { wch: 25 }, // IPS
        { wch: 15 }, // Período
        { wch: 12 }, // A30
        { wch: 12 }, // A60
        { wch: 12 }, // A90
        { wch: 12 }, // A120
        { wch: 12 }, // A180
        { wch: 12 }, // A360
        { wch: 12 }, // SUP360
        { wch: 15 }, // TOTAL
        { wch: 30 }  // Observaciones
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Cartera');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      console.log(`✅ Excel exportado con ${data.length} registros`);
      
      return buffer;

    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      throw new BadRequestException(`Error al exportar: ${error.message}`);
    }
  }

  /**
   * Eliminar datos de cartera por período
   */
  async deleteCarteraDataByPeriodo(epsId: string, periodoId: string): Promise<{
    deletedCount: number;
  }> {
    console.log('🗑️ CarteraService: Eliminando datos por período...', { epsId, periodoId });

    try {
      const result = await this.carteraDataRepository
        .createQueryBuilder()
        .delete()
        .from(CarteraData)
        .where('epsId = :epsId', { epsId })
        .andWhere('periodoId = :periodoId', { periodoId })
        .execute();

      console.log(`✅ Eliminados ${result.affected || 0} registros`);

      return {
        deletedCount: result.affected || 0
      };

    } catch (error) {
      console.error('❌ Error eliminando datos:', error);
      throw new BadRequestException(`Error al eliminar datos: ${error.message}`);
    }
  }

  /**
   * Inicializar períodos por defecto
   */
  async initializePeriodos(): Promise<void> {
    console.log('🔧 CarteraService: Inicializando períodos por defecto...');

    try {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      const currentYear = new Date().getFullYear();
      const years = [currentYear - 1, currentYear, currentYear + 1];

      for (const year of years) {
        for (let mes = 1; mes <= 12; mes++) {
          const periodoExistente = await this.periodoRepository.findOne({
            where: { year, mes }
          });

          if (!periodoExistente) {
            const periodo = this.periodoRepository.create({
              nombre: meses[mes - 1],
              mes,
              year,
              activo: true
            });

            await this.periodoRepository.save(periodo);
            console.log(`✅ Período creado: ${meses[mes - 1]} ${year}`);
          }
        }
      }

      console.log('✅ Períodos inicializados exitosamente');

    } catch (error) {
      console.error('❌ Error inicializando períodos:', error);
      throw new BadRequestException(`Error al inicializar períodos: ${error.message}`);
    }
  }
   async getCarteraData(filters: CarteraFilterDto): Promise<{
  data: CarteraData[];
  total: number;
  totalCartera: number;
}> {
  console.log('💰 CarteraService: getCarteraData con filtros:', filters);

  try {
    // Construir query base
    const queryBuilder = this.carteraDataRepository.createQueryBuilder('cartera')
      .where('cartera.activo = :activo', { activo: true });

    // ✅ INCLUIR RELACIONES CONDICIONALMENTE
    if (filters.includeEPS || filters.includeEPS === undefined) {
      queryBuilder.leftJoinAndSelect('cartera.eps', 'eps');
    }

    if (filters.includeIPS || filters.includeIPS === undefined) {
      queryBuilder.leftJoinAndSelect('cartera.ips', 'ips');
    }

    // Siempre incluir período
    queryBuilder.leftJoinAndSelect('cartera.periodo', 'periodo');

    // Aplicar filtros
    if (filters.epsId) {
      queryBuilder.andWhere('cartera.epsId = :epsId', { epsId: filters.epsId });
    }

    if (filters.periodoId) {
      queryBuilder.andWhere('cartera.periodoId = :periodoId', { periodoId: filters.periodoId });
    }

    if (filters.ipsId) {
      queryBuilder.andWhere('cartera.ipsId = :ipsId', { ipsId: filters.ipsId });
    }

    // ✅ MANEJAR FILTROS MÚLTIPLES (listas separadas por comas)
    if (filters.epsIds && filters.epsIds.trim()) {
      const epsIdArray = filters.epsIds.split(',').map(id => id.trim()).filter(Boolean);
      if (epsIdArray.length > 0) {
        queryBuilder.andWhere('cartera.epsId IN (:...epsIds)', { epsIds: epsIdArray });
      }
    }

    if (filters.ipsIds && filters.ipsIds.trim()) {
      const ipsIdArray = filters.ipsIds.split(',').map(id => id.trim()).filter(Boolean);
      if (ipsIdArray.length > 0) {
        queryBuilder.andWhere('cartera.ipsId IN (:...ipsIds)', { ipsIds: ipsIdArray });
      }
    }

    if (filters.periodoIds && filters.periodoIds.trim()) {
      const periodoIdArray = filters.periodoIds.split(',').map(id => id.trim()).filter(Boolean);
      if (periodoIdArray.length > 0) {
        queryBuilder.andWhere('cartera.periodoId IN (:...periodoIds)', { periodoIds: periodoIdArray });
      }
    }

    // Filtro de búsqueda por texto
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      queryBuilder.andWhere(
        '(eps.nombre ILIKE :search OR ips.nombre ILIKE :search OR cartera.observaciones ILIKE :search)',
        { search: searchTerm }
      );
    }

    // Filtro para mostrar solo registros con datos
    if (filters.soloConDatos) {
      queryBuilder.andWhere('cartera.total > 0');
    }

    // Ordenamiento
    const orderBy = filters.orderBy || 'createdAt';
    const orderDirection = filters.orderDirection || 'DESC';

    switch (orderBy) {
      case 'nombre':
        if (filters.includeIPS !== false) {
          queryBuilder.orderBy('ips.nombre', orderDirection as 'ASC' | 'DESC');
        } else if (filters.includeEPS !== false) {
          queryBuilder.orderBy('eps.nombre', orderDirection as 'ASC' | 'DESC');
        }
        break;
      case 'codigo':
        if (filters.includeIPS !== false) {
          queryBuilder.orderBy('ips.codigo', orderDirection as 'ASC' | 'DESC');
        } else if (filters.includeEPS !== false) {
          queryBuilder.orderBy('eps.codigo', orderDirection as 'ASC' | 'DESC');
        }
        break;
      case 'total':
        queryBuilder.orderBy('cartera.total', orderDirection as 'ASC' | 'DESC');
        break;
      default:
        queryBuilder.orderBy('cartera.createdAt', orderDirection as 'ASC' | 'DESC');
    }

    // Paginación
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 50000); // Límite máximo de 50,000
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Ejecutar consultas
    const [data, total] = await queryBuilder.getManyAndCount();

    // Calcular suma total de cartera
    const sumQueryBuilder = this.carteraDataRepository.createQueryBuilder('cartera')
      .select('SUM(cartera.total)', 'totalCartera')
      .where('cartera.activo = :activo', { activo: true });

    // Aplicar los mismos filtros para el cálculo del total
    if (filters.epsId) {
      sumQueryBuilder.andWhere('cartera.epsId = :epsId', { epsId: filters.epsId });
    }
    if (filters.periodoId) {
      sumQueryBuilder.andWhere('cartera.periodoId = :periodoId', { periodoId: filters.periodoId });
    }
    if (filters.ipsId) {
      sumQueryBuilder.andWhere('cartera.ipsId = :ipsId', { ipsId: filters.ipsId });
    }
    if (filters.soloConDatos) {
      sumQueryBuilder.andWhere('cartera.total > 0');
    }

    const sumResult = await sumQueryBuilder.getRawOne();
    const totalCartera = parseFloat(sumResult?.totalCartera || '0');

    console.log('✅ CarteraService: Datos obtenidos', {
      registros: data.length,
      total: total,
      totalCartera: totalCartera,
      page,
      limit
    });

    return {
      data,
      total,
      totalCartera
    };

  } catch (error) {
    console.error('❌ CarteraService: Error al obtener datos de cartera:', error);
    throw error;
  }
}
}