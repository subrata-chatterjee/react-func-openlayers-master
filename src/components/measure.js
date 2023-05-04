

const Measure = () =>{
    return (
      
        <div style={{ position: "absolute", right: "6px", zIndex:1}}>      
      <label for="type">Measurement type &nbsp;</label>
      <select id="type">
        <option value="LineString" >Length (LineString)</option>
        <option value="Polygon">Area (Polygon)</option>
      </select>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label for="segments">Show segment lengths:&nbsp;</label>
      <input type="checkbox" id="segments" />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label for="clear">Clear previous measure:&nbsp;</label>
      <input type="checkbox" id="clear"  />
    
      </div>       
      
    );
  }
    
  export default Measure;