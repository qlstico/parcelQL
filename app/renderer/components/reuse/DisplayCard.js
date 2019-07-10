import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import dbImage from '../../../assets/images/db-icon.png';
import tableImage from '../../../assets/images/table-icon.png';

const useStyles = makeStyles({
  card: {
    // minWidth: 275
    height: 150,
    width: 150,
  },
  pos: {
    marginBottom: 0,
  },
});

function DisplayCard(props) {
  const classes = useStyles();

  return (
    <Button
      // onClick={() =>
      //   props.type === "db"
      //     ? props.history.push("/tables")
      //     : props.history.push("/single")
      // }
      size="large"
      fullWidth={true}
    >
      <Card className={classes.card}>
        <CardContent>
          <img
            src={props.type === 'db' ? dbImage : tableImage}
            height="55%"
            width="55%"
          />

          <Typography
            className={classes.pos}
            align="center"
            color="textSecondary"
            component="p"
            noWrap
          >
            {props.name}
          </Typography>
        </CardContent>
        <CardActions />
      </Card>
    </Button>
  );
}

export default DisplayCard;
