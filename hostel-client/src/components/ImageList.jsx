import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

export default function StandardImageList(props) {

    const itemData = [
        {
          img: 'http://127.0.0.1:3001/gallery/img_1.jpeg',
          title: 'Breakfast',
        },
        {
          img: 'http://127.0.0.1:3001/gallery/img_2.jpeg',
          title: 'Breakfast',
        },
        
        
  ];
  
  // console.log({image:props.itemData.data.images});
      
  return (
    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
      {props.itemData.data.images.map((item) => (
        <ImageListItem key={item._id}>
          <img
            src={`${item.url}?w=164&h=164&fit=crop&auto=format`}
            srcSet={`${item.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
        
      ))}
    </ImageList>
  );
}

