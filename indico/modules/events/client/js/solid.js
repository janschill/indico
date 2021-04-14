import solidCommentsURL from 'indico-url:events.solid_comments';

import SolidComment from 'solid-comment';

import {indicoAxios} from 'indico/utils/axios';

export default async function setupSolidComments(params) {
  const eventId = params.eventId;
  const eventProtection = params.eventProtection;

  if (eventId && eventProtection) {
    const solidCommentId = `indico-solid-test-cern-ch-${eventId}`;
    const serverUrl = solidCommentsURL({event_id: params.eventId});
    const solidComment = new SolidComment({
      solidCommentId,
      eventVisibility: eventProtection,
      serverStorageEndpointUrl: serverUrl,
      appUrl: window.location.href.split('?')[0],
    });

    await solidComment.initApp(); // render components
    solidComment.setAppClient(indicoAxios); // use own HTTP client
    await fetch(serverUrl) // load comments, pass to solid-comment, render
      .then(response => response.json())
      .then(data => solidComment.setComments(data));
  }
}

window.setupSolidComments = setupSolidComments;
