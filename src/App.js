import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { INITIAL_EVENTS, createEventId } from './event-utils';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import './App.css';
import AppBar from '@material-ui/core/AppBar';

function createData(name, org, visitDurationInMin, availibility) {
  return { name, org, visitDurationInMin, availibility };
}

const rows = [
  createData('Dr. John Doe', 'Kings London Hospital', 15,
    {
      "sun": "10:00 AM - 06:00 PM",
      "mon": "06:00 PM - 09:00 PM",
      "tue": "06:00 PM - 09:00 PM"

    }
  ),
  createData('Dr. Mary Ellis', 'ABC Hospital', 15,
    {
      "sun": "10:00 AM - 06:00 PM",
      "mon": "09:00 PM - 11:00 PM",
      "thu": "11:00 AM - 02:00 PM"
    }
  ),
  createData('Dr. X', 'Mary BD Hospital', 15,
    {
      "mon": "10:00 AM - 06:00 PM",
      "tue": "09:00 PM - 11:00 PM",
      "wed": "11:00 AM - 02:00 PM"
    }
  ),

];

let daysAvailability = [];
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Doctor Name' },
  { id: 'org', numeric: false, disablePadding: true, label: 'Organization' },
  { id: 'visitDurationInMin', numeric: false, disablePadding: true, label: 'Visit Duration In Min' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all doctors' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            Doctor List
          </Typography>
        )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : ''}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const bookingInfoStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const appbarStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textAlign: 'center'
  },
}));
export default function App() {

  const classes = useStyles();
  const bookingInfo = bookingInfoStyles();
  const appbar = appbarStyles();


  const [currentEvents, setCurrentEvents] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selectedDataTableValue, setDataTableValue] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(null);
  const [phoneNo, setPhoneNo] = React.useState(null);
  const [visitReason, setVisitReason] = React.useState(null);
  const [calenderInfo, setCalenderInfo] = React.useState({});
  const [viewDoctorList, setViewDoctorList] = React.useState(true);
  const [viewBookingCalender, setViewBookingCalender] = React.useState(false);



  const onChangeName = (e) => {
    setName(e.target.value);
  };

  const onChangePhoneNo = (e) => {
    setPhoneNo(e.target.value);
  };

  const onChangeVisitReason = (e) => {
    setVisitReason(e.target.value);
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };



  const handleDateSelect = (selectInfo) => {

    let calendarApi = selectInfo && selectInfo.view && selectInfo.view.calendar
    if (calendarApi) {
      calendarApi.changeView('timeGridDay', selectInfo.startStr);
    }

    if (selectInfo && selectInfo.view && selectInfo.view.type === 'timeGridDay') {
      handleClickOpen();
      setCalenderInfo(selectInfo);

    }
  }

  const onHandleSubmit = () => {
    if (calenderInfo) {
      let calendarInfoApi = calenderInfo && calenderInfo.view && calenderInfo.view.calendar
      calendarInfoApi.addEvent({
        id: createEventId(),
        start: calenderInfo.startStr,
        end: calenderInfo.endStr,
        allDay: calenderInfo.allDay,
        name: name,
        phoneNo: phoneNo,
        visitReason: visitReason
      })
    }
    handleClose();
    setName(null);
    setPhoneNo(null);
    setVisitReason(null);
  }




  const handleClick = (event, rowdata) => {
    setViewBookingCalender(true);
    setViewDoctorList(false);
    daysAvailability = [];

    daysAvailability = Object.entries(rowdata.availibility).map(item => {
      if (item[0] == "sun") {
        return item[0] = '0';
      } else if (item[0] == "mon") {
        return item[0] = '1';
      } else if (item[0] == "tue") {
        return item[0] = '2';
      } else if (item[0] == "wed") {
        return item[0] = '3';
      } else if (item[0] == "thu") {
        return item[0] = '4';
      } else if (item[0] == "fri") {
        return item[0] = '5';
      } else if (item[0] == "sat") {
        return item[0] = '6';
      }


    });

    setDataTableValue(rowdata);

    const selectedIndex = selected.indexOf(rowdata.name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, rowdata.name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };



  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event._def.extendedProps.name}</i>
        <i>{eventInfo.event._def.extendedProps.phoneNo}</i>
        <i>{eventInfo.event._def.extendedProps.visitReason}</i>
      </>
    )
  }

  const handleEvents = (events) => {
    setCurrentEvents(events);
  }

  return (

    <div className={appbar.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={appbar.title}>
            Doctor Appointment Booking
    </Typography>
        </Toolbar>
      </AppBar>
      {console.log('selectedDataTableValue', selectedDataTableValue)}
      {viewDoctorList === true ?
        <>
          <Paper className={classes.paper}>
            <EnhancedTableToolbar numSelected={selected.length} />
            <TableContainer>
              <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
                aria-label="enhanced table"
              >
                <EnhancedTableHead
                  classes={classes}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                />

                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row.name);
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.name}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </TableCell>
                          <TableCell component="th" id={labelId} scope="row" padding="none">
                            {row.name}
                          </TableCell>
                          <TableCell align="left">{row.org}</TableCell>
                          <TableCell align="left">{row.visitDurationInMin}</TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Paper>


          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Dense padding"
          />
        </>
        : ''}

      {viewBookingCalender === true ?
        <div className="p-col-12 full-calender">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            slotDuration='00:15:00'
            slotMinTime='10:00:00'
            slotMaxTime='18:00:00'
            eventColor='#378006'
            eventDisplay='block'
            headerToolbar={{
              left: 'prev,next,today',
              center: 'title',
              right: 'myCustomButton dayGridMonth,timeGridWeek,timeGridDay'
            }}
            customButtons={{
              myCustomButton: {
                text: 'view doctor list',
                click: function () {
                  setViewBookingCalender(false);
                  setViewDoctorList(true);
                },
              },
            }}
            timeZone='Asia/Dhaka'
            selectable={true}
            editable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            businessHours={[
              {
                daysOfWeek: daysAvailability,
                startTime: '10:00', // 10am
                endTime: '18:00' // 6pm
              },

            ]}
            weekends={true}
            eventContent={renderEventContent}
            eventsSet={handleEvents} 
          />
        </div>
        : ''}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Booking Information</DialogTitle>
        <DialogContent>
          <TextField
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={onChangeName}
            fullWidth
          />
          <TextField
            id="phoneNo"
            label="Phone No."
            type="number"
            value={phoneNo}
            onChange={onChangePhoneNo}
            fullWidth
          />
          <TextField
            id="visitReason"
            label="Visit Reason"
            value={visitReason}
            onChange={onChangeVisitReason}
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={onHandleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
