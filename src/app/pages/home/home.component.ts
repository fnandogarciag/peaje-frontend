import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../core/services/crud.service';
import { forkJoin } from 'rxjs';

export interface minMaxStatsObject {
  inventario: { maxName: string, maxPrecioF: number, minName: string, minPrecioF: number },
  usando: { maxName: string, maxPrecioF: number, minName: string, minPrecioF: number },
  total: { maxName: string, maxPrecioF: number, minName: string, minPrecioF: number }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private crudService = inject(CrudService);

  tipos = signal<any[]>([]);
  carros = signal<any[]>([]);
  mutaciones = signal<any[]>([]);
  carrosMutaciones = signal<any[]>([]);
  tiempos = signal<any[]>([]);
  mutacionesCols = signal<any[]>([]);
  listTable = signal<any[]>([]);
  listTableUsando = signal<any[]>([]);
  inventarioCounter = signal(0);
  usandoCounter = signal(0);

  hoveredColIndex = signal<number>(-1);
  setHoveredCol(index: number) { this.hoveredColIndex.set(index); }

  showActivosModal = signal(false);
  openActivosModal() { this.showActivosModal.set(true); }
  closeActivosModal() { this.showActivosModal.set(false); }

  showFusionarModal = signal(false);
  fusionCandidates = signal<any[]>([]);
  fusionChains = signal<any[]>([]);
  openFusionarModal() { this.showFusionarModal.set(true); }
  closeFusionarModal() { this.showFusionarModal.set(false); }


  toggleActivo(carro: any, index: number) {
    const newCar = { ...carro, activo: !carro.activo }
    this.crudService.createOrUpdate('carros', { ...newCar })
      .subscribe({
        next: () => {
          const newCarList = [...this.carros()]
          newCarList[index] = newCar;
          this.carros.set(newCarList);
          this.buildListTable();
        },
        error: (err) => console.error('Error actualizando activo', err)
      });
  }

  getTipoNombre(idTipo: number): string {
    return this.tipos().find(t => t.id === idTipo)?.nombre || 'N/A';
  }

  minMaxStats = signal<minMaxStatsObject>({
    inventario: { maxName: '', maxPrecioF: 0, minName: '', minPrecioF: 0 },
    usando: { maxName: '', maxPrecioF: 0, minName: '', minPrecioF: 0 },
    total: { maxName: '', maxPrecioF: 0, minName: '', minPrecioF: 0 }
  });

  ngOnInit() {
    forkJoin({
      tipos: this.crudService.getAll('tipos'),
      carros: this.crudService.getAll('carros'),
      mutaciones: this.crudService.getAll('mutaciones'),
      carrosMutaciones: this.crudService.getAll('carros-mutaciones'),
      tiempos: this.crudService.getAll('tiempo')
    }).subscribe({
      next: (data) => {
        this.tipos.set(data.tipos || []);
        this.carros.set(data.carros || []);
        this.mutaciones.set(data.mutaciones || []);
        this.carrosMutaciones.set(data.carrosMutaciones || []);
        this.tiempos.set(data.tiempos || []);
        this.buildListTable();
      },
      error: (err) => {
        console.error('Error fetching data', err);
      }
    });
  }

  buildListTable() {
    this.mutacionesCols.set([...this.mutaciones()].sort((a, b) => b.orden - a.orden));

    const activeCarros = this.carros().filter(c => c.activo === true || c.activo === 'true' || !('activo' in c));

    const newListTable = activeCarros.map(carro => {
      const tipo = this.tipos().find(t => t.id === carro.idTipo)?.nombre || 'N/A';

      let row: any = {
        id: carro.id,
        tipo,
        nombre: carro.nombre,
        precio: carro.precio || 0,
      };
      let dataFinal = {
        inventario: {
          maxMul: 0,
          maxFinal: 0,
          minMul: Infinity,
          minFinal: 0
        },
        usando: {
          maxMul: 0,
          maxFinal: 0,
          minMul: Infinity,
          minFinal: 0
        },
        total: {
          maxMul: 0,
          maxFinal: 0,
          minMul: Infinity,
          minFinal: 0
        },
      }

      this.mutacionesCols().forEach(mut => {
        const cm = this.carrosMutaciones().find(x => x.idCarro === carro.id && x.idMutacion === mut.id);
        const inventario = cm ? (cm.inventario || 0) : 0;
        const usando = cm ? (cm.usando || 0) : 0;
        const total = inventario + usando;

        if (inventario !== 0) {
          if (mut.multiplicador > dataFinal.inventario.maxMul) {
            dataFinal.inventario.maxMul = mut.multiplicador;
            dataFinal.inventario.maxFinal = row.precio * mut.multiplicador;
          }
          if (mut.multiplicador < dataFinal.inventario.minMul) {
            dataFinal.inventario.minMul = mut.multiplicador;
            dataFinal.inventario.minFinal = row.precio * mut.multiplicador;
          }
        }
        if (usando !== 0) {
          if (mut.multiplicador > dataFinal.usando.maxMul) {
            dataFinal.usando.maxMul = mut.multiplicador;
            dataFinal.usando.maxFinal = row.precio * mut.multiplicador;
          }
          if (mut.multiplicador < dataFinal.usando.minMul) {
            dataFinal.usando.minMul = mut.multiplicador;
            dataFinal.usando.minFinal = row.precio * mut.multiplicador;
          }
        }

        row['mut_' + mut.orden] = {
          id: cm?.id || 0,
          inventario,
          usando,
          total
        };
      });

      row.dataFinal = dataFinal;

      return row;
    })
    this.listTable.set([...newListTable]);

    let newInventario = 0;
    let newUsando = 0;
    this.carrosMutaciones().forEach(m => {
      newInventario += m.inventario
      newUsando += m.usando
    });
    this.inventarioCounter.set(newInventario);
    this.usandoCounter.set(newUsando);


    this.calculateMinMax('inventario');
    this.calculateMinMax('usando');

    const maxMul = this.mutacionesCols()[0].multiplicador;
    this.listTableUsando.set(newListTable.filter(c => (c.precio * maxMul) >= this.getMinMaxStat('usando').minPrecioF))
    this.updateFusionCandidates();
    if (this.listTableUsando().length === 0) {
      this.listTableUsando.set([newListTable[0]])
    }
  }

  updateFusionCandidates() {
    const maxMutacionId = this.mutacionesCols()[0].id;
    let candidates = this.carrosMutaciones().filter(x => x.idMutacion < maxMutacionId);
    candidates = candidates.map(x => {
      const carro = this.carros().find(c => c.id === x.idCarro);
      const tipo = this.tipos().find(t => t.id === carro.idTipo)?.nombre || 'N/A';
      const mutacion = this.mutaciones().find(m => m.id === x.idMutacion);
      const mutacionNextMul = this.mutaciones().find(m => m.orden === mutacion.orden + 1).multiplicador;
      return {
        ...x,
        total: x.inventario + x.usando,
        idTipo: carro.idTipo,
        tipo,
        mutacionNombre: mutacion.nombre,
        carroNombre: carro.nombre,
        nextValue: carro.precio * mutacionNextMul,
        orden: mutacion.orden
      }
    });
    const newFusionCandidates = candidates.filter(x => x.total >= 3).sort((a, b) => b.nextValue - a.nextValue).map(x => {
      const tiempo = this.tiempos().find(t => t.idMutacion === x.idMutacion && t.idTipo === x.idTipo)
      return {
        ...x,
        hora: tiempo ? tiempo.hora : 0,
        minuto: tiempo ? tiempo.minuto : 0,
        segundo: tiempo ? tiempo.segundo : 0
      }
    })

    this.fusionCandidates.set(newFusionCandidates);

    if (candidates.length === 0) return;

    let candidatosFaltantes = [...candidates];
    let prediccion = [];
    while (candidatosFaltantes.length > 0) {
      const carroNombre = candidatosFaltantes[0].carroNombre;
      const tipo = candidatosFaltantes[0].tipo;
      const carro = this.carros().find(c => c.id === candidatosFaltantes[0].idCarro);
      candidates = candidatosFaltantes.filter(x => x.idCarro === carro.id);

      let fusiones = 0;
      candidates = this.mutaciones().map(mut => {

        const cm = candidates.find(x => {
          return x.idMutacion === mut.id
        });
        if (!cm) {
          fusiones = 0
          return {
            orden: 0,
            mutacionNombre: 0,
            before: 0,
            fusions: 0,
            after: 0,
          }
        }
        const newTotal = (cm.total + fusiones)
        fusiones = Math.trunc(newTotal / 3);
        return {
          orden: mut.orden,
          mutacionNombre: mut.nombre,
          before: cm.total,
          fusions: fusiones,
          after: newTotal - fusiones * 3,
        }
      }).filter(c => c.fusions !== 0);

      if (candidates.length > 1) {
        const newMut = this.mutaciones().find(m => m.orden === candidates[candidates.length - 1].orden + 1)
        prediccion.push({
          carroNombre,
          tipo,
          finalCount: carro.precio * newMut.multiplicador,
          finalMutacionNombre: newMut.nombre,
          steps: [...candidates]
        })
      }

      candidatosFaltantes = candidatosFaltantes.filter(x => x.idCarro !== carro.id);
    }
    this.fusionChains.set([...prediccion].sort((a, b) => b.finalCount - a.finalCount));
  }

  fusionar(item: {
    id: number;
    idCarro: number;
    idMutacion: number;
    orden: number;
    inventario: number;
    usando: number;
    total: number;
  }) {
    const mutacionOrden = this.mutaciones().find(m => m.id === item.idMutacion).orden
    const fromInventario = Math.min(3, item.inventario);
    const fromUsando = 3 - fromInventario;
    const sourcePayload = {
      id: item.id,
      idCarro: item.idCarro,
      idMutacion: item.idMutacion,
      inventario: item.inventario - fromInventario,
      usando: item.usando - fromUsando
    };

    const nextMutation = this.mutaciones().find(m => m.orden === mutacionOrden + 1)

    const nextExisting = this.carrosMutaciones().map(x => {
      const orden = this.mutaciones().find(m => m.id === x.idMutacion).orden
      return {
        ...x, orden
      }
    }).find(
      x => x.idCarro === item.idCarro && x.orden === item.orden + 1
    );
    const nextPayload: any = nextExisting
      ? {
        id: nextExisting.id,
        idCarro: nextExisting.idCarro,
        idMutacion: nextExisting.idMutacion,
        inventario: nextExisting.inventario + 1,
        usando: nextExisting.usando
      }
      : {
        idCarro: item.idCarro,
        idMutacion: nextMutation.id,
        inventario: 1,
        usando: 0
      };

    forkJoin({
      source: this.crudService.createOrUpdate('carros-mutaciones', sourcePayload),
      next: this.crudService.createOrUpdate('carros-mutaciones', nextPayload)
    }).subscribe({
      next: (res) => {
        const updated = [...this.carrosMutaciones()];
        const sourceIdx = updated.findIndex(x => x.id === sourcePayload.id);
        updated[sourceIdx] = { ...updated[sourceIdx], ...sourcePayload };

        if (nextExisting) {
          const nextIdx = updated.findIndex(x => x.id === nextExisting.id);
          updated[nextIdx] = { ...updated[nextIdx], ...nextPayload };
        } else {
          updated.push({ ...nextPayload, id: res.next.id });
        }

        this.carrosMutaciones.set(updated);
        this.buildListTable();
      },
      error: (err) => {
        console.error('Error fusionando carro-mutacion', err);
      }
    });
  }

  calculateMinMax(section: 'inventario' | 'usando' | 'total') {
    let maxName = 'N/A';
    let maxPrecioF = 0;
    let minName = 'N/A';
    let minPrecioF = Infinity;

    this.listTable().forEach(r => {
      if (r.dataFinal[section].maxFinal > maxPrecioF) {
        maxPrecioF = r.dataFinal[section].maxFinal;
        maxName = r.nombre;
      }
      if (r.dataFinal[section].minFinal > 0 && r.dataFinal[section].minFinal < minPrecioF) {
        minPrecioF = r.dataFinal[section].minFinal;
        minName = r.nombre;
      }
    })

    this.minMaxStats.set({
      ...this.minMaxStats(),
      [section]: { maxName, maxPrecioF, minName, minPrecioF }
    });
  }

  getMinMaxStat(sectionKey: 'inventario' | 'usando') {
    return this.minMaxStats()[sectionKey];
  }

  changeValue(sectionKey: 'inventario' | 'usando', carroId: number, mutacionId: number, delta: number, idCarMut: number) {
    if (idCarMut > 0) {
      const updated = this.carrosMutaciones().map(x => ({ ...x }));
      const cm = updated[this.carrosMutaciones().findIndex(x => x.idCarro === carroId && x.idMutacion === mutacionId)];

      if (sectionKey === 'inventario') {
        if (delta < 0 && cm.inventario === 0) return; 
        cm.inventario = cm.inventario + delta;

      } else if (sectionKey === 'usando') {
        if (delta > 0) {
          cm.usando = cm.usando + 1;
          if (cm.inventario > 0) cm.inventario = cm.inventario - 1;
        } else {
          if (cm.usando === 0) return;
          cm.usando = cm.usando - 1;
          cm.inventario = cm.inventario + 1;
        }
      }

      this.crudService.createOrUpdate('carros-mutaciones', {
        id: idCarMut,
        idCarro: cm.idCarro,
        idMutacion: cm.idMutacion,
        inventario: cm.inventario,
        usando: cm.usando
      }).subscribe({
        next: () => {
          this.carrosMutaciones.set(updated);
          this.buildListTable();
        },
        error: (err) => console.error('Error actualizando carro-mutacion', err)
      });

    } else if (delta > 0) {
      const newCm: any = {
        idCarro: carroId,
        idMutacion: mutacionId,
        inventario: sectionKey === 'inventario' ? 1 : 0,
        usando: sectionKey === 'usando' ? 1 : 0
      };

      this.crudService.createOrUpdate('carros-mutaciones', {
        idCarro: newCm.idCarro,
        idMutacion: newCm.idMutacion,
        inventario: newCm.inventario,
        usando: newCm.usando
      }).subscribe({
        next: (data) => {
          newCm.id = data.id;
          this.carrosMutaciones.set([...this.carrosMutaciones(), newCm]);
          this.buildListTable();
        },
        error: (err) => console.error('Error creando carro-mutacion', err)
      });
    }
  }
}
