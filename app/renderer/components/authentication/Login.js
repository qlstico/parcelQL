import React from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  },
  dense: {
    marginTop: 19
  },
  menu: {
    width: 200
  }
}));

// Used in CreateConnection and EditExistingConnection
const Login = ({
  handleSubmit,
  handleInputChange,
  handleCheckboxChange,
  values
}) => {
  const classes = useStyles();

  return (
    <div>
      <h1>Hello, QLstico!</h1>
      <h1>Redefining databse access starts here!</h1>
      <form className={classes.container} noValidate onSubmit={handleSubmit}>
        <TextField
          label="User"
          type="text"
          name="user"
          className={classes.textField}
          value={values.user}
          onChange={handleInputChange}
          placeholder={values.user}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          className={classes.textField}
          value={values.password}
          onChange={handleInputChange}
          placeholder={values.password}
        />
        <TextField
          label="Host"
          type="text"
          name="host"
          className={classes.textField}
          value={values.host}
          onChange={handleInputChange}
          placeholder={values.host}
        />
        <TextField
          label="Database Name"
          type="text"
          name="databaseName"
          className={classes.textField}
          value={values.databaseName}
          onChange={handleInputChange}
          placeholder={values.databaseName}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="ssl"
              checked={values.ssl}
              onChange={handleCheckboxChange}
              value={values.ssl}
              color="primary"
            />
          }
          label="SSL?"
        />

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default withRouter(Login);
