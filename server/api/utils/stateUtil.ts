export const abbreviationState = {
  [State.AL]: 'Alabama',
  [State.AK]: 'Alaska',
  [State.AZ]: 'Arizona',
  [State.AR]: 'Arkansas',
  [State.CA]: 'California',
  [State.CO]: 'Colorado',
  [State.CT]: 'Connecticut',
  [State.DE]: 'Delaware',
  [State.FL]: 'Florida',
  [State.GA]: 'Georgia',
  [State.HI]: 'Hawaii',
  [State.ID]: 'Idaho',
  [State.IL]: 'Illinois',
  [State.IN]: 'Indiana',
  [State.IA]: 'Iowa',
  [State.KS]: 'Kansas',
  [State.KY]: 'Kentucky',
  [State.LA]: 'Louisiana',
  [State.ME]: 'Maine',
  [State.MD]: 'Maryland',
  [State.MA]: 'Massachusetts',
  [State.MI]: 'Michigan',
  [State.MN]: 'Minnesota',
  [State.MS]: 'Mississippi',
  [State.MO]: 'Missouri',
  [State.MT]: 'Montana',
  [State.NE]: 'Nebraska',
  [State.NV]: 'Nevada',
  [State.NH]: 'New Hampshire',
  [State.NJ]: 'New Jersey',
  [State.NM]: 'New Mexico',
  [State.NY]: 'New York',
  [State.NC]: 'North Carolina',
  [State.ND]: 'North Dakota',
  [State.OH]: 'Ohio',
  [State.OK]: 'Oklahoma',
  [State.OR]: 'Oregon',
  [State.PA]: 'Pennsylvania',
  [State.RI]: 'Rhode Island',
  [State.SC]: 'South Carolina',
  [State.SD]: 'South Dakota',
  [State.TN]: 'Tennessee',
  [State.TX]: 'Texas',
  [State.UT]: 'Utah',
  [State.VT]: 'Vermont',
  [State.VA]: 'Virginia',
  [State.WA]: 'Washington',
  [State.WV]: 'West Virginia',
  [State.WI]: 'Wisconsin',
  [State.WY]: 'Wyoming',
};

export const getStateNameFromAbbreviation = (stateAbb: State) => {
  return abbreviationState[stateAbb];
};

export const getAbbreviationFromStateName = (stateName: string): string => {
  const searchResults = Object.keys(abbreviationState).filter(
    stateAbb => abbreviationState[stateAbb] === stateName
  );

  return searchResults[0] ? searchResults[0] : stateName;
};

export const stateOptions = Object.keys(abbreviationState).map(stateAbb => ({
  value: stateAbb,
  label: `${stateAbb} (${abbreviationState[stateAbb]})`,
}));
