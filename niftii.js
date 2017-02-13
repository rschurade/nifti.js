/**
* A class to load niftii files and provide slices as png textures.
*
* @version 0.1
* @author Ralph Schurade <schurade@gmx.de>
* @copyright Copyright (c) 2011, Ralph Schurade
* @link 
* @license MIT License
*
*/
(function() {
	window.Niftii = function () {
		var data = [];
		var hdr = {};
		var dim1 = 0, dim2=0, dim3=0;
		var max = -1000;
		var min = 1000;
		var zero = 0;
		var type = '';
		var loaded = false;

		var texSize = 128;
				
		this.load = function(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'arraybuffer';

			xhr.onload = function(e) {
				data = new DataView(this.response); // this.response == uInt8Array.buffer

				hdr.sizeof_hdr = data.getInt32( 0, true ); // 0
				hdr.data_type = []; // 4
				for ( var i = 0; i < 10; ++i ) hdr.data_type.push( data.getUint8(  4 + i ) );
				hdr.db_name = []; // 14
				for ( var i = 0; i < 18; ++i ) hdr.db_name.push( data.getUint8(  14 + i ) );
				hdr.extents = data.getInt32( 32, true ); // 32
				hdr.session_error = data.getInt16( 36, true ) // 36
				hdr.regular = data.getUint8( 38 ); // 38      
				hdr.dim_info = data.getUint8( 39 ); // 39     
				hdr.dim = []; // 40
				for ( var i = 0; i < 8; ++i ) hdr.dim.push( data.getInt16(  40 + i * 2, true ) );					
				hdr.intent_p1  = data.getFloat32( 56, true );  
				hdr.intent_p2  = data.getFloat32( 60, true ); 
				hdr.intent_p3  = data.getFloat32( 64, true ); 
				hdr.intent_code  = data.getInt16( 68, true ); 
				hdr.datatype = data.getInt16( 70, true );     
				hdr.bitpix = data.getInt16( 72, true );       
				hdr.slice_start = data.getInt16( 74, true );  
				hdr.pixdim = [];
				for ( var i = 0; i < 8; ++i ) hdr.pixdim.push( data.getFloat32(  76 + i * 4, true ) );					
				hdr.vox_offset = data.getFloat32( 108, true ); // 108
				hdr.scl_slope  = data.getFloat32( 112, true );  
				hdr.scl_inter  = data.getFloat32( 116, true );  
				hdr.slice_end = data.getInt16( 120, true );    
				hdr.slice_code  = data.getUint8( 122 );  
				hdr.xyzt_units  = data.getUint8( 123 );  
				hdr.cal_max = data.getFloat32( 124, true );     
				hdr.cal_min = data.getFloat32( 128, true );     
				hdr.slice_duration = data.getFloat32( 132, true );
				hdr.toffset = data.getFloat32( 136, true );    
				hdr.glmax = data.getInt32( 140, true );        
				hdr.glmin = data.getInt32( 144, true );        
				hdr.descrip = []; // 148
				for ( var i = 0; i < 80; ++i ) hdr.descrip.push( data.getUint8(  148 + i ) );					
				hdr.aux_file = []; // 228
				for ( var i = 0; i < 24; ++i ) hdr.aux_file.push( data.getUint8(  228 + i ) );					
				hdr.qform_code  = data.getInt16( 252, true );  
				hdr.sform_code  = data.getInt16( 254, true );  
				hdr.quatern_b  = data.getFloat32( 256, true );  
				hdr.quatern_c  = data.getFloat32( 260, true );  
				hdr.quatern_d  = data.getFloat32( 264, true );   
				hdr.qoffset_x  = data.getFloat32( 268, true );   
				hdr.qoffset_y  = data.getFloat32( 272, true );   
				hdr.qoffset_z  = data.getFloat32( 276, true );   
				hdr.srow_x = []; // 280
				for ( var i = 0; i < 4; ++i ) hdr.srow_x.push( data.getFloat32(  280 + i * 4, true ) );
				hdr.srow_y = []; // 296
				for ( var i = 0; i < 4; ++i ) hdr.srow_y.push( data.getFloat32(  296 + i * 4, true ) );
				hdr.srow_z = []; // 312
				for ( var i = 0; i < 4; ++i ) hdr.srow_z.push( data.getFloat32(  312 + i * 4, true ) );
				hdr.intent_name = []; // 328
				for ( var i = 0; i < 16; ++i ) hdr.intent_name.push( data.getUint8(  328 + i ) );					
				hdr.magic = []; // 344
				for ( var i = 0; i < 4; ++i ) hdr.magic.push( data.getUint8(  344 + i ) );					

								
				
				dim1 = Math.min( 255, hdr.dim[1] );
				dim2 = Math.min( 255, hdr.dim[2] );
				dim3 = Math.min( 255, hdr.dim[3] );
				
				if ( hdr.datatype === 2 ) {
					for ( var i = 88; i < data.byteLength; ++i ) {
						if ( data.getUint8( i ) < min ) min = data.getUint8( i );
						if ( data.getUint8( i ) > max ) max = data.getUint8( i );
					}
					console.log( "min: " + min + " max: " + max );
					//min = 0;
					//max = 255;
					if (hdr.dim[4] === 1 ) {
						type = 'anatomy';
					}
					if (hdr.dim[4] === 3) {
						type = 'rgb';
					}
				}

				if ( hdr.datatype === 16 ) {
					for ( var i = 88; i < data.byteLength; i+=4 ) {
						if ( data.getFloat32( i ) < min ) min = data.getFloat32( i );
						if ( data.getFloat32( i ) > max ) max = data.getFloat32( i );
					}
					//console.log( "min: " + min + " max: " + max );
					
					var div = max - min;
					zero = ( 0 - min ) / div;
					for ( var j = 88; j < data.length; j+=4 ) {
						data.setFloat32(j, ( data.getFloat32(j) - min ) / div );
					}
					if ( min < 0 ) {
						type = 'fmri';
					}
					else {
						type = 'overlay';
					}
				}
				
				loaded = true;
				if ( callback ) callback();		
			};
			xhr.send();
		};
		
		this.loaded = function() {
			return loaded;
		}
	
		this.getImage = function (orient, pos) {
			if ( !loaded ) console.log( "DEBUG nifti file not finished loading");
			if ( orient === 'sagittal' && pos > hdr.dim[1] ) pos = 0;
			if ( orient === 'coronal' && pos > hdr.dim[2] ) pos = 0;
			if ( orient === 'axial' && pos > hdr.dim[3] ) pos = 0;
			
			if ( hdr.datatype === 2 ) {
				if (hdr.dim[4] === 1 ) {
					return getImageGrayByte(orient,pos);
				}
				if (hdr.dim[4] === 3) {
					return getImageRGBByte(orient,pos);
				}
			}
			else if ( hdr.datatype === 16 ) {
				if (hdr.dim[4] === 1 ) {
					return getImageGrayFloat(orient,pos);
				}
			}
		};
		
		function getImageGrayByte(orient, pos) {
			var c2d = document.createElement("canvas");
			
			
			
			if ( orient === "axial" ) {
				c2d.width = hdr.dim[1];
				c2d.height = hdr.dim[2];
				var ctx = c2d.getContext("2d");
				var imageData = ctx.getImageData(0, 0, c2d.width, c2d.height);
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var y = 0; y < dim2; ++y )
		            {
		            	var col = data.getUint8( getId(x,y,pos) );
		            	var index = 4 * (y * imageData.width + x);
		                imageData.data[index] = col;
		                imageData.data[index+1] = col;
		                imageData.data[index+2] = col;
		                imageData.data[index+3] = ( col > 0 ) ? 255 : 0;
		            }
		        }
			}
			
			if ( orient === "coronal" ) {
				c2d.width = hdr.dim[1];
				c2d.height = hdr.dim[3];
				var ctx = c2d.getContext("2d");
				var imageData = ctx.getImageData(0, 0, c2d.width, c2d.height);
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		            	var col = data.getUint8( getId(x,pos,(dim3-1)-z) );
		            	var index = 4 * (z * imageData.width + x);
		            	imageData.data[index] = col;
		                imageData.data[index+1] = col;
		                imageData.data[index+2] = col;
		                imageData.data[index+3] = ( col > 0 ) ? 255 : 0;
		            }
		        }
			}
			
			if ( orient === "sagittal" ) {
				c2d.width = hdr.dim[2];
				c2d.height = hdr.dim[3];
				var ctx = c2d.getContext("2d");
				var imageData = ctx.getImageData(0, 0, c2d.width, c2d.height);
				for( var y = 0; y < dim2; ++y )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		            	var col = data.getUint8( getId(pos,y,z) );
		            	var index = 4 * (z * imageData.width + y);
		            	imageData.data[index] = col;
		                imageData.data[index+1] = col;
		                imageData.data[index+2] = col;
		                imageData.data[index+3] = ( col > 0 ) ? 255 : 0;
		            }
		        }
			}
			ctx.putImageData( imageData, 0, 0 );
			return imageData;
		} 
		
		function getId(x,y,z) {
			return 352 + x + (y * hdr.dim[1]) + (z * hdr.dim[1] * hdr.dim[2]);
		}
		
		function getIdFloat(x,y,z) {
			return 88 + x + (y * hdr.dim[1]) + (z * hdr.dim[1] * hdr.dim[2]);
		}
		
		function getImageRGBByte(orient, pos) {
			var c2d = document.createElement("canvas");
			c2d.width = texSize;
			c2d.height = texSize;
			var ctx = c2d.getContext("2d");
			var imageData = ctx.getImageData(0, 0, c2d.width, c2d.height);
			
			var gOff = hdr.dim[1] * hdr.dim[2] * hdr.dim[3];
			var bOff = 2 * gOff;
			
			if ( orient === "axial" ) {
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var y = 0; y < dim2; ++y )
		            {
		            	var r = data.getUint8( getId(x,y,pos) );
		            	var g = data.getUint8(parseInt(getId(x,y,pos))+parseInt(gOff) );
		            	var b = data.getUint8(parseInt(getId(x,y,pos))+parseInt(bOff) );
		            	var index = 4 * (y * imageData.width + x);
		            	imageData.data[index] = r;
		                imageData.data[index+1] = g;
		                imageData.data[index+2] = b;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			if ( orient === "coronal" ) {
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		                var r = data.getUint8( getId(x,pos,z) );
		            	var g = data.getUint8( getId(x,pos,z)+gOff );
		            	var b = data.getUint8( getId(x,pos,z)+bOff );
		            	var index = 4 * (z * imageData.width + x);
		            	imageData.data[index] = r;
		                imageData.data[index+1] = g;
		                imageData.data[index+2] = b;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			if ( orient === "sagittal" ) {
				for( var y = 0; y < dim2; ++y )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		                var r = data.getUint8( getId(pos-1+1,y,z) );
		            	var g = data.getUint8( getId(pos-1+1,y,z)+gOff );
		            	var b = data.getUint8( getId(pos-1+1,y,z)+bOff );
		            	var index = 4 * (z * imageData.width + y);
		            	imageData.data[index] = r;
		                imageData.data[index+1] = g;
		                imageData.data[index+2] = b;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			return imageData;
		}
		
		function getImageGrayFloat(orient, pos) {
			var c2d = document.createElement("canvas");
			c2d.width = texSize;
			c2d.height = texSize;
			var ctx = c2d.getContext("2d");
			var imageData = ctx.getImageData(0, 0, c2d.width, c2d.height);
			
			for ( var i = 0; i < 256*256; ++i ) {
				imageData.data[i*4] = zero*255;
                imageData.data[i*4+1] = zero*255;
                imageData.data[i*4+2] = zero * 255;
                imageData.data[i*4+3] = 255;
			}
			
			if ( orient === "axial" ) {
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var y = 0; y < dim2; ++y )
		            {
		            	var col = data.getFloat32( getIdFloat(x,y,pos) );
		            	var index = 4 * (y * imageData.width + x);
		                imageData.data[index] = col * 255;
		                imageData.data[index+1] = col * 255;
		                imageData.data[index+2] = col * 255;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			if ( orient === "coronal" ) {
				for( var x = 0; x < dim1; ++x )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		            	var col = data.getFloat32( getIdFloat(x,pos,z) );
		            	var index = 4 * (z * imageData.width + x);
		            	imageData.data[index] = col * 255;
		                imageData.data[index+1] = col * 255;
		                imageData.data[index+2] = col * 255;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			if ( orient === "sagittal" ) {
				for( var y = 0; y < dim2; ++y )
		        {
		            for( var z = 0; z < dim3; ++z )
		            {
		            	var col = data.getFloat32( getIdFloat(pos-1+1,y,z) );
		            	var index = 4 * (z * imageData.width + y);
		            	imageData.data[index] = col * 255;
		                imageData.data[index+1] = col * 255;
		                imageData.data[index+2] = col * 255;
		                imageData.data[index+3] = 255;
		            }
		        }
			}
			
			return imageData;
		}
		
		this.getMin = function() {
			return min;
		};
		
		this.getMax = function() {
			return max;
		};
		
		this.getDims = function() {
			return { "nx" : hdr.dim[1], "ny" : hdr.dim[2], "nz" : hdr.dim[3], "dx" : hdr.pixdim[1], "dy" : hdr.pixdim[2], "dz" : hdr.pixdim[3] }; 
		};
		
		this.getType = function() {
			return type;
		};
	};
})();
