// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';
import Zoom from 'ol/control/Zoom';
import ScaleLine from 'ol/control/ScaleLine';
import { Draw,Modify } from 'ol/interaction';
import {
  Circle as CircleStyle,
  Fill,
  RegularShape,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import {LineString, Point} from 'ol/geom';
import {getArea, getLength} from 'ol/sphere';
import { Image as ImageLayer } from 'ol/layer';
import { ImageWMS ,OSM} from 'ol/source';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()
  const [ scaleLine , setScaleLine ] = useState()
  const [measurement, setMeasurement] = useState('');
const [totalLength, setTotalLength] = useState(0);

  // pull refs
  const mapElement = useRef()
  
  const mapRef = useRef()
  mapRef.current = map
  useEffect( () => {
    const vectorSource = new VectorSource();
    
    const typeSelect = document.getElementById('type');
    const showSegments = document.getElementById('segments');
    const clearPrevious = document.getElementById('clear');
  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });
  
  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
    }),
  });
  
  const tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });
  
  const modifyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
    text: new Text({
      text: 'Drag to modify',
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });
  
  const segmentStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12,
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
  });

  const segmentStyles = [segmentStyle];

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

const modify = new Modify({source: vectorSource, style: modifyStyle});

let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
  const styles = [style];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type) {
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

const vector = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        
        new TileLayer({
          source: new OSM(),
        }),       

      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [75.09880, 33.25211],
        zoom: 11
      }),
      controls: []
    })

    const geotiffLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://ourindus.com/geoserver/USBRL-WS/wms?',
        params: {
          'LAYERS': 'USBRL-WS:USBRL_Base_Image_KB',
          'FORMAT': 'image/png',          
        },
        ratio: 1,
        serverType: 'geoserver',
        projection: 'EPSG:4326'
      })
    });
    
initialMap.addLayer(geotiffLayer);

    // set map onclick handler
    initialMap.on('click', handleMapClick)
    //initialMap.addControl(zoomControl);

    // save map and vector layer references to state
    setMap(initialMap)
    //setFeaturesLayer(initalFeaturesLayer)
    const zoomControl = new Zoom({
      className: 'custom-zoom-control',
      zoomInLabel: '+',
      zoomOutLabel: '-',
    });
    initialMap.addControl(zoomControl);
    
    let draw; // global so we can remove it later

    function addInteraction() {
      const drawType = typeSelect.value;
      const activeTip =
        'Click to continue drawing the ' +
        (drawType === 'Polygon' ? 'polygon' : 'line');
      const idleTip = 'Click to start measuring';
      let tip = idleTip;
      draw = new Draw({
        source: vectorSource,
        type: drawType,
        style: function (feature) {
          return styleFunction(feature, showSegments.checked, drawType, tip);
        },
      });
      draw.on('drawstart', function () {
        if (clearPrevious.checked) {
          vectorSource.clear();
        }
        modify.setActive(false);
        tip = activeTip;
      });
      draw.on('drawend', function () {
        modifyStyle.setGeometry(tipPoint);
        modify.setActive(true);
        initialMap.once('pointermove', function () {
          modifyStyle.setGeometry();
        });
        tip = idleTip;
      });
      modify.setActive(true);
      initialMap.addInteraction(draw);
    }
    
    typeSelect.onchange = function () {
      initialMap.removeInteraction(draw);
      addInteraction();
    };
    
    //addInteraction();
    
    showSegments.onchange = function () {
      vector.changed();
      draw.getOverlay().changed();
    };
  },[])

  // map click handler
  const handleMapClick = (event) => {
    
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:4326', 'EPSG:3857')

    // set React state
    setSelectedCoord( clickedCoord )
    
  }

  // render component
  return (      
    <div>
      <form>
      <label for="type">Measurement type &nbsp;</label>
      <select id="type">
        <option value="LineString" >Length (LineString)</option>
        <option value="Polygon">Area (Polygon)</option>
      </select>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label for="segments">Show segment lengths:&nbsp;</label>
      <input type="checkbox" id="segments" checked />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label for="clear">Clear previous measure:&nbsp;</label>
      <input type="checkbox" id="clear"  />
    </form>
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>
    </div>
  ) 

}

export default MapWrapper