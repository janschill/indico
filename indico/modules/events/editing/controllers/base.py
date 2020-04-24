# This file is part of Indico.
# Copyright (C) 2002 - 2020 CERN
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see the
# LICENSE file for more details.

from __future__ import unicode_literals

from flask import request, session
from werkzeug.exceptions import Unauthorized

from indico.modules.events.contributions.controllers.display import RHContributionDisplayBase
from indico.modules.events.controllers.base import RHDisplayEventBase
from indico.modules.events.editing.models.editable import Editable, EditableType
from indico.modules.events.editing.settings import editing_settings
from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.events.models.events import Event
from indico.web.rh import RequireUserMixin


class TokenAccessMixin(object):
    SERVICE_ALLOWED = False

    def _token_can_access(self):
        # we need to "fish" the event here because at this point _check_params
        # hasn't run yet
        event = Event.get_one(int(request.view_args['confId']), is_deleted=False)
        if not self.SERVICE_ALLOWED or not request.bearer_token:
            return False

        event_token = editing_settings.get(event, 'service_token')
        if request.bearer_token != event_token:
            raise Unauthorized('Invalid bearer token')

        return True

    def _check_csrf(self):
        # check CSRF if there is no bearer token or there's a session cookie
        if session.user or not request.bearer_token:
            super(TokenAccessMixin, self)._check_csrf()


class RHEditingBase(TokenAccessMixin, RequireUserMixin, RHDisplayEventBase):
    """Base class for editing RHs that don't reference an editable."""

    EVENT_FEATURE = 'editing'

    def _check_access(self):
        self.is_service_call = TokenAccessMixin._token_can_access(self)
        if not self.is_service_call:
            RHDisplayEventBase._check_access(self)
            RequireUserMixin._check_access(self)


class RHEditingManagementBase(TokenAccessMixin, RHManageEventBase):
    """Base class for editing RHs that don't reference an editable."""

    EVENT_FEATURE = 'editing'
    PERMISSION = 'editing_manager'

    def _check_access(self):
        self.is_service_call = TokenAccessMixin._token_can_access(self)
        if not self.is_service_call:
            super(RHEditingManagementBase, self)._check_access()


class RHEditableTypeManagementBase(RHEditingManagementBase):
    """Base class for editable type RHs."""

    def _process_args(self):
        RHManageEventBase._process_args(self)
        self.editable_type = EditableType[request.view_args['type']]


class RHContributionEditableBase(RequireUserMixin, RHContributionDisplayBase):
    """Base class for operations on an editable."""

    EVENT_FEATURE = 'editing'

    normalize_url_spec = {
        'locators': {
            lambda self: self.contrib
        },
        'preserved_args': {'type'}
    }

    def _check_access(self):
        RequireUserMixin._check_access(self)
        RHContributionDisplayBase._check_access(self)

    def _process_args(self):
        RHContributionDisplayBase._process_args(self)
        self.editable_type = EditableType[request.view_args['type']]
        self.editable = (Editable.query
                         .with_parent(self.contrib)
                         .filter_by(type=self.editable_type)
                         .first())
