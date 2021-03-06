import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import QuestionerLayout from 'components/questionerLayout';
import Layout from 'components/layout';
import Question from '../../components/question';
import Button from 'components/bootstrapButton';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import { withStyles } from '@material-ui/core/styles';
import api from 'api';
import messages from './messages';
import * as actionsTypes from './constants';
import monster1 from 'images/bespectacledMonster.png';
import monster2 from 'images/blueMonster.png';
import monster3 from 'images/hatMonster.png';
import monster4 from 'images/purpleMonster.png';
import monster5 from 'images/redMonster.png';
import monster6 from 'images/yellowMonster.png';
import mobMonster1 from 'images/mobBespectacledMonster.png';
import mobMonster2 from 'images/mobBlueMonster.png';
import mobMonster3 from 'images/mobHatMonster.png';
import mobMonster4 from 'images/mobPurpleMonster.png';
import mobMonster5 from 'images/mobRedMonster.png';
import mobMonster6 from 'images/mobYellowMonster.png';
import withWidth from '@material-ui/core/withWidth/withWidth';
import Hidden from '@material-ui/core/Hidden';

const normImages = [monster1, monster2, monster3, monster4, monster5, monster6];
const mobImages = [
  mobMonster1,
  mobMonster2,
  mobMonster3,
  mobMonster4,
  mobMonster5,
  mobMonster6,
];

class Questioner extends React.Component {
  constructor(props) {
    super(props);

    const {
      questionerConfig: { data: questionerConfig },
    } = this.props;
    const answers = questionerConfig
      ? this.formDefaultAnswers(questionerConfig)
      : [];

    //TODO
    const steps = 5;
    let restNums = [];
    for (let i = 0; i < normImages.length; i++) {
      restNums.push(i);
    }
    this.rndImages = {norm: [], mob: []};
    for (let step = 0; step < steps; step++) {
      const rndNum = Math.round((restNums.length - 1) * Math.random());
      this.rndImages.norm[step] = normImages[rndNum];
      this.rndImages.mob[step] = mobImages[rndNum];
      restNums = restNums.filter(i => i !== rndNum);
    }
    this.state = { step: 0, answers };
  }

  componentDidMount() {
    this.props.getQuestionerConfig().catch(error => {});
  }

  componentWillReceiveProps(nextProps) {
    const { questionerConfig: { data: nextQuestionerConfig }} = nextProps;
    const { questionerConfig: { data: questionerConfig }} = this.props;
    if (!questionerConfig && nextQuestionerConfig) {
      const answers = this.formDefaultAnswers(nextQuestionerConfig);
      this.setState({ answers });
    }
  }

  formDefaultAnswers(questionerConfig) {
    const { steps } = questionerConfig;
    const answers = [];
    steps.forEach((stepConfig, step) => {
      const { type, appearance } = stepConfig;
      if (type === 'select' && appearance === 'switcher') {
        answers[step] = stepConfig.options[0].value;
      } else if (type === 'select' && appearance === 'slider') {
        answers[step] = 0;
      }
    });
    return answers;
  }

  onForward = async () => {
    const {
      questionerConfig: {
        data: { steps },
      },
      saveAnswers,
      history,
    } = this.props;
    const { step, answers } = this.state;
    if (step >= steps.length - 1) {
      try {
        await saveAnswers(answers);
        history.push('/result');
      } catch (e) {}
    } else {
      //TODO add validatiion of curr step
      const isCurrStepValid = this.isStepValid(answers[step]);
      if (isCurrStepValid) {
        this.setState(({ step }) => ({ step: step + 1 }));
      } else {
        console.log(`${step} step is not valid`);
        //TODO show error
      }
    }
  }

  isStepValid(value) {
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (!keys.length) return false;
      return !!keys.find(key => !!value[key]);
    } else {
      return !!value && value !== 0;
    }
  }

  onAnswer = (step, value) => {
    const answers = [...this.state.answers];
    answers[step] = value;
    this.setState({ answers });
  }

  renderButton = ({ disabled, valueMessage, className, fullWidth }) => (
    <Button
      disabled={disabled}
      valueMessage={valueMessage}
      rightIcon={ArrowForward}
      onClick={this.onForward}
      className={className}
      fullWidth={fullWidth}
    />
  )

  render() {
    const {
      questionerConfig: {
        isFetching: questionerConfigFetching,
        data: questionerConfig,
      },
      answersSavingInProgress,
      classes,
      history,
      width,
    } = this.props;
    const { step, answers } = this.state;

    const answer = answers[step];
    const disabled =
      questionerConfigFetching ||
      answersSavingInProgress ||
      typeof answer === 'undefined';

    const monsterImg = this.rndImages[width === 'xs' ? 'mob' : 'norm'][step];

    return (
      <Layout history={history} width={width}>
        <Helmet>
          <title>Questioner</title>
          <meta
            name="description"
            content="Questioner page of Find your monster application"
          />
        </Helmet>
        {!questionerConfigFetching && questionerConfig && (
          <React.Fragment>
            <QuestionerLayout
              monsterImg={monsterImg}
              stepNum={step + 1}
              totalSteps={questionerConfig.steps.length}
              width={width}
            >
              <Question
                config={questionerConfig.steps[step]}
                value={answer}
                id={step}
                onChange={this.onAnswer}
              />
              <Hidden xsDown>
                {this.renderButton({
                  disabled,
                  valueMessage: messages[step < questionerConfig.steps.length - 1 ? 'next' : 'submit'],
                  rightIcon: ArrowForward,
                  className: classes.formButton,
                })}
              </Hidden>
            </QuestionerLayout>
            <Hidden smUp>
              {this.renderButton({
                disabled,
                valueMessage: messages[step < questionerConfig.steps.length - 1 ? 'next' : 'submit'],
                className: classes.mobNextButton,
                fullWidth: true,
                onClick: this.onSubmit,
              })}
            </Hidden>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

const styles = theme => ({
  nextButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.unit * 4,
  },
  mobNextButton: {
    marginTop: theme.spacing.unit * 5,
  },
});

const mapStateToProps = (state, ownProps) => {
  const {
    questioner: {
      questionerConfig,
      savedAnswers: { isFetching: answersSavingInProgress },
    },
  } = state;
  return { questionerConfig, answersSavingInProgress };
};

const mapDispatchToProps = (dispatch, ownProps) => (
  bindActionCreators(
    {
      getQuestionerConfig() {
        return dispatch => {
          const accessToken = ownProps.auth.auth.getAccessToken();
          dispatch({ type: actionsTypes.QUESTIONER_CONFIG_REQUEST });
          return api.getQuestionerConfig(accessToken)
            .then(response => {
              dispatch({
                type: actionsTypes.QUESTIONER_CONFIG_SUCCESS,
                data: response,
              });
            })
            .catch(error => {
              dispatch({
                type: actionsTypes.QUESTIONER_CONFIG_FAILURE,
                data: error,
              });
              throw error;
            });
        };
      },
      saveAnswers(...ars) {
        return dispatch => {
          const accessToken = ownProps.auth.auth.getAccessToken();
          dispatch({ type: actionsTypes.SAVE_ANSWERS_REQUEST });
          return api.saveAnswers(accessToken, ...ars)
            .then(response => {
              dispatch({
                type: actionsTypes.SAVE_ANSWERS_SUCCESS,
                data: response,
              });
            })
            .catch(error => {
              dispatch({
                type: actionsTypes.SAVE_ANSWERS_FAILURE,
                data: error,
              });
              throw error;
            });
        };
      },
    },
    dispatch,
  )
);

Questioner.propTypes = {
  history: PropTypes.object.isRequired,
  questionerConfig: PropTypes.shape({
    data: PropTypes.shape({
      steps: PropTypes.array.isRequired,
    }),
    isFetching: PropTypes.bool.isRequired,
  }),
  answersSavingInProgress: PropTypes.bool.isRequired,
  saveAnswers: PropTypes.func.isRequired,
  getQuestionerConfig: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'questioner', reducer });

const ConnectedQuestioner = compose(
  // Put `withReducer` before `withConnect`
  withStyles(styles),
  withWidth(),
  withReducer,
  withConnect,
)(Questioner);

ConnectedQuestioner.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default ConnectedQuestioner;
