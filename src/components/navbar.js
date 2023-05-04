// Importing files from Material-UI
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

// Using Inline Styling
const useStyles = makeStyles((theme) => ({
root: {
	flexGrow: 1,
},
menuButton: {
	marginRight: theme.spacing(2),
},
}));

// Exporting Default Navbar to the App.js File
export default function Navbar() {
const classes = useStyles();

return (
	<div className={classes.root} >
	<AppBar position="static" style={{ backgroundColor: "black" }}>
		<Toolbar variant="dense">		
		<Typography variant="h6"  color="inherit">
			GeoMap
		</Typography>
        
		</Toolbar>
	</AppBar>
	</div>
);
}
