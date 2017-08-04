
import {
  Input, OnDestroy, OnChanges, OnInit, SimpleChange, ViewChildren, QueryList,
  Component,  AfterViewInit, ContentChildren
} from '@angular/core';

import {ClusterManager} from './cluster-manager';
import {IClusterOptions, IClusterStyle} from './google-clusterer-types';
import {AgmMarker} from "@agm/core";

@Component({
  selector: 'agm-cluster',
  providers: [ ClusterManager ],
  template : " "
})
export class AgmMarkerCluster implements OnDestroy, OnChanges, OnInit, IClusterOptions, AfterViewInit {
  /**
   * The grid size of a cluster in pixels
   */
  @Input() gridSize: number;
  
  /**
   * The maximum zoom level that a marker can be part of a cluster.
   */
  @Input() maxZoom: number;
  
  /**
   * Whether the default behaviour of clicking on a cluster is to zoom into it.
   */
  @Input() zoomOnClick: boolean;
  
  /**
   * Whether the center of each cluster should be the average of all markers in the cluster.
   */
  @Input() averageCenter: boolean;
  
  /**
   * The minimum number of markers to be in a cluster before the markers are hidden and a count is shown.
   */
  @Input() minimumClusterSize: number;
  
  /**
   * An object that has style properties.
   */
  @Input() styles: IClusterStyle;
  
  @Input() imagePath: string;
  @Input() imageExtension: string;
  
  @ContentChildren(AgmMarker) agmmarkers : QueryList<AgmMarker>
  
  constructor(private cluster: ClusterManager) {}
  
  /** @internal */
  ngOnDestroy() { this.cluster.clearMarkers(); }
  
  /** @internal */
  ngOnChanges(changes: {[key: string]: SimpleChange }) {
    if (changes['gridSize']) {
      this.cluster.setGridSize(this);
    }
    if (changes['maxZoom']) {
      this.cluster.setMaxZoom(this);
    }
    if (changes['styles']) {
      this.cluster.setStyles(this);
    }
    if (changes['zoomOnClick']) {
      this.cluster.setZoomOnClick(this);
    }
    if (changes['averageCenter']) {
      this.cluster.setAverageCenter(this);
    }
    if (changes['minimumClusterSize']) {
      this.cluster.setMinimumClusterSize(this);
    }
    if (changes['styles']) {
      this.cluster.setStyles(this);
    }
    if (changes['imagePath']) {
      this.cluster.setImagePath(this);
    }
    if (changes['imageExtension']) {
      this.cluster.setImageExtension(this);
    }
  }
  
  /** @internal */
  ngOnInit() {}
  
  ngAfterViewInit(): void {
    
    this.cluster.init({
      gridSize: this.gridSize,
      maxZoom: this.maxZoom,
      zoomOnClick: this.zoomOnClick,
      averageCenter: this.averageCenter,
      minimumClusterSize: this.minimumClusterSize,
      styles: this.styles,
      imagePath: this.imagePath,
      imageExtension: this.imageExtension,
    },this.agmmarkers);
  
    console.log('agmmark', );
  

    
  }
}
