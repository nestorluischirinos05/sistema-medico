import BasicList from './NavListDrawer'
import { AppBar, Button, Drawer, IconButton, Toolbar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useState } from 'react'
export default function Navbar(){
    const [open,setOpen]=useState(false)
    return(
        <>
            <AppBar position='static'>
                <Toolbar>
                    <IconButton color='inherit' size='large'
                                onClick={()=> setOpen(true)}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Button color='inherit'>Home</Button>
                    <Button color='inherit'>Login</Button>
                </Toolbar>
                
            </AppBar>
            <Drawer open={open}
                    anchor='left'
                    onClose={()=> setOpen(false)}
            >
            <BasicList/>
            </Drawer>
        </>
        
    )
}