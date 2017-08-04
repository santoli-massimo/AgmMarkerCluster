import {Injectable, NgZone, QueryList} from '@angular/core';

import 'js-marker-clusterer';

import {MarkerManager} from '@agm/core/services/managers/marker-manager';
import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';
import {AgmMarker} from '@agm/core/directives/marker';
import {AgmMarkerCluster} from './cluster';
import {Marker} from '@agm/core/services/google-maps-types';
import {IMarkerClusterer, IClusterOptions} from './google-clusterer-types';

declare var MarkerClusterer: IMarkerClusterer;

class Deferred<T> {
  private _promise: Promise<T>;
  private fate: 'resolved' | 'unresolved';
  private state: 'pending' | 'fulfilled' | 'rejected';
  private _resolve: Function;
  private _reject: Function;
  
  constructor() {
    this.state = 'pending';
    this.fate = 'unresolved';
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    
    this.promise.then(
      () => this.state = 'fulfilled',
      () => this.state = 'rejected',
    );
  }
  
  get promise(): Promise<T> {
    return this._promise;
  }
  
  resolve(value?: any) {
    if (this.fate === 'resolved') {
      throw 'Deferred cannot be resolved twice';
    }
    this.fate = 'resolved';
    this._resolve(value);
  }
  
  reject(reason?: any) {
    if (this.fate === 'resolved') {
      throw 'Deferred cannot be resolved twice';
    }
    this.fate = 'resolved';
    this._reject(reason);
  }
  
  isResolved() {
    return this.fate === 'resolved';
  }
  
  isPending() {
    return this.state === 'pending';
  }
  
  isFulfilled() {
    return this.state === 'fulfilled';
  }
  
  isRejected() {
    return this.state === 'rejected';
  }
}

@Injectable()
export class ClusterManager {
  private _deferred: Deferred<IMarkerClusterer>;
  
  constructor(public markerManager : MarkerManager, public mapsWrap : GoogleMapsAPIWrapper, protected zone: NgZone) {
    console.log('markerManager', markerManager);
    
    this._deferred = new Deferred<IMarkerClusterer>();
  }
  
  init(options: IClusterOptions, markersQuery): void {
    console.log('mapswrap',this.mapsWrap);
    
    this.mapsWrap.getNativeMap().then(map => {
      const clusterer = new MarkerClusterer(map, [], options);
      this._deferred.resolve(clusterer);
      return clusterer;
    });
    this.updateCluster(markersQuery)
    markersQuery.changes.subscribe( e => this.updateCluster(e) )
    
  }
  
  private updateCluster(markersQuery: QueryList<AgmMarker>){
    this._deferred.promise.then(cluster => {
      cluster.clearMarkers()
      markersQuery.forEach( marker => {
        this.markerManager.getNativeMarker(marker).then(m=> cluster.addMarker(m) )
      })
    });
  }
  
  addMarker(marker: AgmMarker): void {
    console.log('add');
  
    const clusterPromise: Promise<IMarkerClusterer> = this._deferred.promise;
    const markerPromise = this.mapsWrap
      .createMarker({
        position: {
          lat: marker.latitude,
          lng: marker.longitude
        },
        label: marker.label,
        draggable: marker.draggable,
        icon: marker.iconUrl,
        opacity: marker.opacity,
        visible: marker.visible,
        zIndex: marker.zIndex,
        title: marker.title
      });
    
    Promise
      .all([clusterPromise, markerPromise])
      .then(([cluster, marker]) => {
      console.log(marker);
        return cluster.addMarker(marker);
      });
    
    this.markerManager.addMarker(marker)
  }
  
  deleteMarker(marker: AgmMarker): Promise<void> {
    console.log('delelte');
    const m = this.markerManager.getNativeMarker(marker);
    
    if (m == null) {
      // marker already deleted
      return Promise.resolve();
    }
    return m.then((m: Marker) => {
      this.zone.run(() => {
        this._deferred.promise.then(cluster => {
          cluster.removeMarker(m);
          this.markerManager.deleteMarker(marker);
        });
      });
    });
  }
  
  clearMarkers(): Promise<void> {
    console.log('clear');
    return this._deferred.promise.then(cluster => {
      cluster.clearMarkers();
    });
  }
  
  setGridSize(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      cluster.setGridSize(c.gridSize);
    });
  }
  
  setMaxZoom(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      cluster.setMaxZoom(c.maxZoom);
    });
  }
  
  setStyles(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      cluster.setStyles(c.styles);
    });
  }
  
  setZoomOnClick(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      if (c.zoomOnClick !== undefined) {
        cluster.zoomOnClick_ = c.zoomOnClick;
      }
    });
  }
  
  setAverageCenter(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      if (c.averageCenter !== undefined) {
        cluster.averageCenter_ = c.averageCenter;
      }
    });
  }
  
  setImagePath(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      if (c.imagePath !== undefined) {
        cluster.imagePath_ = c.imagePath;
      }
    });
  }
  
  setMinimumClusterSize(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      if (c.minimumClusterSize !== undefined) {
        cluster.minimumClusterSize_ = c.minimumClusterSize;
      }
    });
  }
  
  setImageExtension(c: AgmMarkerCluster): void {
    this._deferred.promise.then(cluster => {
      if (c.imageExtension !== undefined) {
        cluster.imageExtension_ = c.imageExtension;
      }
    });
  }
}
